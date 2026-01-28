// background.js (MV3 service worker, "type": "module")

const DEBUG = true; // Enable for debugging ML API calls
const log = (...args) => DEBUG && console.log('[PG]', ...args);

// ML API configuration
const ML_API_URL = 'https://phishguard-production-f4cc.up.railway.app/predict';
const ML_ENABLED = true; // Set to false to disable ML predictions

// Draw circular icon with OffscreenCanvas. We return 16/32/48 for DPI variants.
async function drawIcon(hex, size) {
  const c = new OffscreenCanvas(size, size);
  const ctx = c.getContext('2d');

  ctx.clearRect(0, 0, size, size);

  // drop shadow
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 + size * 0.08, size * 0.42, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.fill();

  // white ring for contrast on dark toolbars
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.44, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // main disc
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.38, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}

const ICON_CACHE = new Map();
async function getIconImageData(hex) {
  if (ICON_CACHE.has(hex)) return ICON_CACHE.get(hex);
  const img16 = await drawIcon(hex, 16);
  const img32 = await drawIcon(hex, 32);
  const img48 = await drawIcon(hex, 48);
  const set = { 16: img16, 32: img32, 48: img48 };
  ICON_CACHE.set(hex, set);
  return set;
}

async function setIconFor(tabId, label) {
  // Guard: ignore if tab no longer exists
  try {
    const t = await chrome.tabs.get(tabId);
    if (!t || t.id !== tabId) return;
  } catch {
    return;
  }
  const color =
    label === 'safe' ? '#2ecc71' :        // green
      label === 'suspicious' ? '#ff9800' :        // yellow
        label === 'malicious' ? '#e74c3c' :        // red
          '#95a5a6';         // unknown → gray

  const imageData = await getIconImageData(color);
  chrome.action.setIcon({ tabId, imageData }, () => {
    if (chrome.runtime.lastError) log('setIcon error:', chrome.runtime.lastError.message);
  });
  chrome.action.setBadgeText({ tabId, text: '' });

  // Set tooltip so you can verify what the worker classified
  chrome.action.setTitle({ tabId, title: `PhishGuard: ${label}` });
}

// Datasets
const SAFE_DATASET = [
  // Social Media & Communication
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com',
  'reddit.com', 'pinterest.com', 'tumblr.com', 'snapchat.com', 'tiktok.com',
  'discord.com', 'telegram.org', 'whatsapp.com', 'signal.org', 'viber.com',
  'line.me', 'wechat.com', 'skype.com', 'zoom.us', 'teams.microsoft.com',
  'slack.com', 'messenger.com', 'vk.com', 'ok.ru', 'weibo.com',

  // Video & Streaming
  'youtube.com', 'netflix.com', 'hulu.com', 'disney.com', 'disneyplus.com',
  'hbo.com', 'hbonow.com', 'max.com', 'amazon.com', 'primevideo.com',
  'spotify.com', 'soundcloud.com', 'twitch.tv', 'vimeo.com', 'dailymotion.com',
  'peacocktv.com', 'paramountplus.com', 'appletv.com', 'crunchyroll.com',
  'fubo.tv', 'sling.com', 'hotstar.com', 'youtube.com',

  // E-Commerce & Shopping
  'amazon.com', 'ebay.com', 'etsy.com', 'shopify.com', 'walmart.com',
  'target.com', 'bestbuy.com', 'costco.com', 'homedepot.com', 'lowes.com',
  'wayfair.com', 'zappos.com', 'nike.com', 'adidas.com', 'shein.com',
  'aliexpress.com', 'alibaba.com', 'jd.com', 'taobao.com', 'mercari.com',
  'poshmark.com', 'depop.com', 'offerup.com', 'craigslist.org', 'gumtree.com',
  'overstock.com', 'newegg.com', 'microcenter.com', 'gamestop.com',

  // Tech Companies & Platforms
  'google.com', 'microsoft.com', 'apple.com', 'meta.com', 'nvidia.com',
  'intel.com', 'amd.com', 'qualcomm.com', 'samsung.com', 'sony.com',
  'lg.com', 'hp.com', 'dell.com', 'lenovo.com', 'asus.com',
  'acer.com', 'msi.com', 'razer.com', 'corsair.com', 'logitech.com',

  // Cloud Services & Storage
  'dropbox.com', 'onedrive.com', 'icloud.com', 'drive.google.com',
  'mega.com', 'box.com', 'pcloud.com', 'sync.com', 'backblaze.com',
  'aws.amazon.com', 'azure.microsoft.com', 'cloud.google.com', 'digitalocean.com',
  'linode.com', 'vultr.com', 'heroku.com', 'vercel.com', 'netlify.com',

  // Developer Tools & Platforms
  'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com',
  'stackexchange.com', 'dev.to', 'medium.com', 'hashnode.com',
  'codepen.io', 'jsfiddle.net', 'replit.com', 'codesandbox.io',
  'docker.com', 'kubernetes.io', 'npmjs.com', 'pypi.org', 'nuget.org',
  'maven.apache.org', 'rubygems.org', 'packagist.org', 'kaggle.com',

  // Education & Learning
  'khanacademy.org', 'coursera.org', 'udemy.com', 'edx.org', 'udacity.com',
  'lynda.com', 'skillshare.com', 'pluralsight.com', 'codecademy.com',
  'freecodecamp.org', 'w3schools.com', 'mdn.io', 'developer.mozilla.org',
  'microsoft.com', 'oracle.com', 'ibm.com', 'fcrit.ac.in', 'sp.fcrit.ac.in',

  // News & Media
  'bbc.com', 'cnn.com', 'nytimes.com', 'washingtonpost.com', 'theguardian.com',
  'reuters.com', 'ap.org', 'npr.org', 'abcnews.go.com', 'cbsnews.com',
  'nbcnews.com', 'foxnews.com', 'msnbc.com', 'bloomberg.com', 'wsj.com',
  'ft.com', 'economist.com', 'time.com', 'newsweek.com', 'usatoday.com',
  'independent.co.uk', 'telegraph.co.uk', 'dailymail.co.uk', 'mirror.co.uk',
  'lemonde.fr', 'spiegel.de', 'repubblica.it', 'elpais.com',

  // Finance & Banking
  'paypal.com', 'stripe.com', 'square.com', 'venmo.com', 'cash.app',
  'chase.com', 'bankofamerica.com', 'wellsfargo.com', 'citi.com',
  'usbank.com', 'capitalone.com', 'americanexpress.com', 'discover.com',
  'schwab.com', 'fidelity.com', 'etrade.com', 'tdameritrade.com',
  'vanguard.com', 'robinhood.com', 'coinbase.com', 'binance.com',
  'kraken.com', 'gemini.com', 'bitfinex.com',

  // Travel & Booking
  'booking.com', 'expedia.com', 'kayak.com', 'priceline.com', 'hotels.com',
  'airbnb.com', 'vrbo.com', 'tripadvisor.com', 'trivago.com', 'agoda.com',
  'travelocity.com', 'orbitz.com', 'cheaptickets.com', 'google.com',
  'skyscanner.com', 'momondo.com', 'hipmunk.com',

  // Food & Delivery
  'ubereats.com', 'doordash.com', 'grubhub.com', 'postmates.com',
  'instacart.com', 'shipt.com', 'amazon.com', 'fresh.amazon.com',
  'wholefoodsmarket.com', 'kroger.com', 'safeway.com', 'wegmans.com',
  'starbucks.com', 'mcdonalds.com', 'subway.com', 'dominos.com',
  'pizzahut.com', 'kfc.com', 'tacobell.com', 'chipotle.com',

  // Gaming
  'steam.com', 'epicgames.com', 'xbox.com', 'playstation.com',
  'nintendo.com', 'roblox.com', 'minecraft.net', 'riotgames.com',
  'blizzard.com', 'ea.com', 'ubisoft.com', 'activision.com',
  'valvesoftware.com', 'unity.com', 'unrealengine.com',

  // Government & Official
  'usa.gov', 'gov.uk', 'canada.ca', 'australia.gov.au', 'gov.au',
  'gov.in', 'gov.br', 'gov.fr', 'gov.de', 'gov.it',
  'irs.gov', 'ssa.gov', 'va.gov', 'nih.gov', 'nasa.gov',
  'fbi.gov', 'cia.gov', 'nsa.gov', 'whitehouse.gov',

  // Health & Fitness
  'webmd.com', 'mayoclinic.org', 'healthline.com', 'nih.gov',
  'who.int', 'cdc.gov', 'fda.gov', 'medlineplus.gov',
  'myfitnesspal.com', 'fitbit.com', 'garmin.com', 'strava.com',

  // Wikipedia & Knowledge
  'wikipedia.org', 'wikimedia.org', 'wiktionary.org', 'wikiquote.org',
  'wikibooks.org', 'wikisource.org', 'wikiversity.org', 'wikidata.org',
  'wikinews.org', 'commons.wikimedia.org',

  // Archives & Libraries
  'archive.org', 'libraryofcongress.gov', 'britishlibrary.uk',
  'loc.gov', 'europeana.eu',

  // Non-Profit Organizations
  'wikipedia.org', 'mozilla.org', 'wikimedia.org', 'eff.org',
  'fsf.org', 'apache.org', 'gnu.org', 'linuxfoundation.org',

  // Productivity & Business Tools
  'microsoft.com', 'office.com', 'google.com', 'adobe.com',
  'salesforce.com', 'oracle.com', 'sap.com', 'ibm.com',
  'atlassian.com', 'trello.com', 'asana.com', 'monday.com',
  'notion.so', 'evernote.com', 'onenote.com', 'obsidian.md',

  // Search Engines
  'google.com', 'bing.com', 'duckduckgo.com', 'yahoo.com',
  'baidu.com', 'yandex.com', 'ask.com', 'startpage.com',

  // Email Services
  'gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com',
  'mail.com', 'aol.com', 'icloud.com', 'zoho.com',

  // Domain & Hosting
  'godaddy.com', 'namecheap.com', 'bluehost.com', 'hostgator.com',
  'siteground.com', 'dreamhost.com', 'wpengine.com', 'cloudflare.com',
  'name.com', 'register.com', 'domains.google',

  // Content Management
  'wordpress.com', 'wordpress.org', 'blogger.com', 'wix.com',
  'squarespace.com', 'weebly.com', 'tumblr.com', 'ghost.org',

  // Image & Design
  'imgur.com', 'flickr.com', '500px.com', 'unsplash.com',
  'pexels.com', 'pixabay.com', 'canva.com', 'adobe.com',
  'figma.com', 'sketch.com', 'dribbble.com', 'behance.net',

  // Music & Audio
  'spotify.com', 'apple.com', 'music.apple.com', 'youtube.com',
  'soundcloud.com', 'bandcamp.com', 'pandora.com', 'iheart.com',
  'tidal.com', 'deezer.com', 'amazon.com', 'music.amazon.com',

  // Messaging & Chat
  'whatsapp.com', 'telegram.org', 'signal.org', 'discord.com',
  'slack.com', 'microsoft.com', 'teams.microsoft.com', 'zoom.us',
  'skype.com', 'viber.com', 'line.me', 'wechat.com',

  // Job & Career
  'linkedin.com', 'indeed.com', 'glassdoor.com', 'monster.com',
  'careerbuilder.com', 'ziprecruiter.com', 'dice.com', 'upwork.com',
  'fiverr.com', 'freelancer.com', 'peopleperhour.com',

  // Real Estate
  'zillow.com', 'realtor.com', 'redfin.com', 'trulia.com',
  'apartments.com', 'rent.com', 'apartmentguide.com',

  // Automotive
  'cars.com', 'autotrader.com', 'carmax.com', 'cargurus.com',
  'edmunds.com', 'kbb.com', 'tesla.com', 'ford.com', 'gm.com',
  'toyota.com', 'honda.com', 'bmw.com', 'mercedes-benz.com',

  // Sports
  'espn.com', 'nfl.com', 'nba.com', 'mlb.com', 'nhl.com',
  'fifa.com', 'uefa.com', 'ncaa.com', 'sports.yahoo.com',

  // Weather
  'weather.com', 'accuweather.com', 'weather.gov', 'bbc.com',

  // Maps & Navigation
  'google.com', 'maps.google.com', 'apple.com', 'map.apple.com',
  'openstreetmap.org', 'mapquest.com', 'waze.com',

  // Language & Translation
  'translate.google.com', 'duolingo.com', 'babbel.com', 'rosetta.com',
  'lingoda.com', 'busuu.com', 'memrise.com',

  // Dating
  'tinder.com', 'bumble.com', 'match.com', 'okcupid.com',
  'hinge.com', 'eharmony.com', 'zoosk.com', 'plentyoffish.com',

  // File Sharing & Torrents (Legal)
  'dropbox.com', 'wetransfer.com', 'sendspace.com', 'mediafire.com',

  // Cloud Computing
  'aws.amazon.com', 'azure.microsoft.com', 'cloud.google.com',
  'ibm.com', 'oracle.com', 'salesforce.com',

  // Open Source Foundations
  'apache.org', 'eclipse.org', 'linuxfoundation.org', 'mozilla.org',
  'wikimedia.org', 'fsf.org', 'gnu.org', 'opensource.org',

  // Certifications & Testing
  'comptia.org', 'isc2.org', 'pearsonvue.com', 'prometric.com',

  // Security & Privacy
  'eff.org', 'torproject.org', 'letsencrypt.org', 'cloudflare.com',
  '1password.com', 'lastpass.com', 'dashlane.com', 'bitwarden.com',

  // Retail Chains (US & Global)
  'walmart.com', 'target.com', 'costco.com', 'bestbuy.com',
  'homedepot.com', 'lowes.com', 'michaels.com', 'joann.com',
  'dickssportinggoods.com', 'basspro.com', 'cabelas.com',

  // Fashion & Apparel
  'nike.com', 'adidas.com', 'underarmour.com', 'puma.com',
  'zara.com', 'h&m.com', 'hm.com', 'gap.com', 'oldnavy.com',
  'uniqlo.com', 'levi.com', 'calvinklein.com', 'tommy.com',

  // Home & Furniture
  'ikea.com', 'wayfair.com', 'potterybarn.com', 'westelm.com',
  'crateandbarrel.com', 'ashleyfurniture.com', 'rooms2go.com',

  // Pet Supplies
  'chewy.com', 'petsmart.com', 'petco.com', 'petfinder.com',

  // Beauty & Cosmetics
  'sephora.com', 'ulta.com', 'ulta.com', 'macys.com',

  // Tools & Hardware
  'homedepot.com', 'lowes.com', 'harborfreight.com', 'grainger.com',

  // Office Supplies
  'staples.com', 'officedepot.com', 'officemax.com',

  // Specialty Retail
  'bedbathandbeyond.com', 'williams-sonoma.com', 'surlatable.com',

  // Additional Popular Sites
  'craigslist.org', 'yelp.com', 'tripadvisor.com', 'booking.com',
  'expedia.com', 'priceline.com', 'kayak.com', 'airbnb.com',

  // Regional Popular Sites
  'naver.com', 'qq.com', 'baidu.com', 'taobao.com', 'tmall.com',
  'rakuten.co.jp', 'mercari.com', 'yandex.ru', 'mail.ru',

  // Major Universities & Education Institutions
  'harvard.edu', 'mit.edu', 'stanford.edu', 'yale.edu', 'princeton.edu',
  'columbia.edu', 'uchicago.edu', 'caltech.edu', 'berkeley.edu', 'ucla.edu',
  'nyu.edu', 'usc.edu', 'umich.edu', 'cornell.edu', 'northwestern.edu',
  'duke.edu', 'jhu.edu', 'upenn.edu', 'dartmouth.edu', 'brown.edu',
  'vanderbilt.edu', 'rice.edu', 'wustl.edu', 'georgetown.edu', 'notre Dame.edu',
  'cmu.edu', 'virginia.edu', 'unc.edu', 'wfu.edu', 'emory.edu',
  'bu.edu', 'tufts.edu', 'bc.edu', 'brandeis.edu', 'tulane.edu',
  'uf.edu', 'fsu.edu', 'miami.edu', 'gtech.edu', 'gatech.edu',
  'uiuc.edu', 'purdue.edu', 'indiana.edu', 'psu.edu', 'pitt.edu',
  'osu.edu', 'uc.edu', 'case.edu', 'umich.edu', 'msu.edu',
  'wisc.edu', 'umn.edu', 'iastate.edu', 'uiowa.edu', 'illinois.edu',
  'utexas.edu', 'tamu.edu', 'baylor.edu', 'tcu.edu', 'rice.edu',
  'asu.edu', 'ua.edu', 'auburn.edu', 'ufl.edu', 'uoregon.edu',
  'washington.edu', 'uw.edu', 'oregonstate.edu', 'uidaho.edu', 'unr.edu',
  'unlv.edu', 'ucsd.edu', 'ucsb.edu', 'ucdavis.edu', 'ucsc.edu',
  'uci.edu', 'ucr.edu', 'ucmerced.edu', 'sjsu.edu', 'csulb.edu',
  'sdsu.edu', 'calpoly.edu', 'cpp.edu', 'calstate.edu', 'csu.edu',
  'caltech.edu', 'usc.edu', 'pepperdine.edu', 'lmu.edu', 'chapman.edu',
  'oxford.ac.uk', 'cambridge.ac.uk', 'imperial.ac.uk', 'ucl.ac.uk', 'lse.ac.uk',
  'kcl.ac.uk', 'manchester.ac.uk', 'ed.ac.uk', 'bristol.ac.uk', 'warwick.ac.uk',
  'durham.ac.uk', 'leeds.ac.uk', 'birmingham.ac.uk', 'nottingham.ac.uk', 'sheffield.ac.uk',
  'universityofcalifornia.edu', 'utoronto.ca', 'ubc.ca', 'mcgill.ca', 'ualberta.ca',
  'uvic.ca', 'queensu.ca', 'mcmaster.ca', 'westernu.ca', 'carleton.ca',
  'yorku.ca', 'uwaterloo.ca', 'sfu.ca', 'concordia.ca', 'dal.ca',
  'sydney.edu.au', 'unimelb.edu.au', 'anu.edu.au', 'unsw.edu.au', 'uq.edu.au',
  'monash.edu', 'adelaide.edu.au', 'curtin.edu.au', 'rmit.edu.au', 'uts.edu.au',

  // Major News & Media (Expanded)
  'theatlantic.com', 'newyorker.com', 'vox.com', 'vice.com', 'buzzfeed.com',
  'huffpost.com', 'dailybeast.com', 'slate.com', 'salon.com', 'motherjones.com',
  'propublica.org', 'politico.com', 'rollcall.com', 'thehill.com', 'breitbart.com',
  'dailycaller.com', 'theblaze.com', 'townhall.com', 'nationalreview.com', 'weeklystandard.com',
  'reason.com', 'jacobinmag.com', 'commondreams.org', 'democracynow.org', 'truthout.org',
  'alternet.org', 'rawstory.com', 'thinkprogress.org', 'talkingpointsmemo.com', 'crooksandliars.com',
  'mediaite.com', 'lawfareblog.com', 'justsecurity.org', 'warontherocks.com', 'defenseone.com',
  'theintercept.com', 'firstlook.org', 'glennbeck.com', 'rushlimbaugh.com', 'hannity.com',
  'infowars.com', 'rt.com', 'aljazeera.com', 'france24.com', 'dw.com',
  'euronews.com', 'telesurtv.net', 'scmp.com', 'japantimes.co.jp', 'koreatimes.co.kr',
  'straitstimes.com', 'channelnewsasia.com', 'timesofindia.indiatimes.com', 'thehindu.com',
  'indiatoday.in', 'ndtv.com', 'zeenews.india.com', 'firstpost.com', 'economictimes.indiatimes.com',
  'timeslive.co.za', 'news24.com', 'mg.co.za', 'iol.co.za', 'ewn.co.za',
  'folha.uol.com.br', 'globo.com', 'g1.globo.com', 'estadao.com.br', 'veja.abril.com.br',
  'eluniversal.com.mx', 'el-pais.com', 'elpais.com', 'abc.es', 'elmundo.es',
  'lavanguardia.com', 'elperiodico.com', 'publico.es', 'elconfidencial.com', 'larazon.es',
  'corriere.it', 'repubblica.it', 'lastampa.it', 'ilsole24ore.com', 'ansaI.it',
  'faz.net', 'spiegel.de', 'welt.de', 'sueddeutsche.de', 'zeit.de',
  'bild.de', 'focus.de', 'stern.de', 'handelsblatt.com', 'ftd.de',
  'lefigaro.fr', 'lemonde.fr', 'liberation.fr', 'leparisien.fr', 'franceinfo.fr',
  'bfmtv.com', 'lcI.fr', 'france24.com', 'rfi.fr', 'europe1.fr',
  'lequipe.fr', 'rmc.fr', 'rtl.fr', 'sudouest.fr', 'ouest-france.fr',

  // Additional Tech Companies & Services
  'oracle.com', 'cisco.com', 'vmware.com', 'redhat.com', 'suse.com',
  'canonical.com', 'ubuntu.com', 'debian.org', 'opensuse.org', 'archlinux.org',
  'fedora.org', 'centos.org', 'rockylinux.org', 'almalinux.org', 'freebsd.org',
  'netbsd.org', 'openbsd.org', 'trueos.org', 'dragonflybsd.org', 'ghostbsd.org',
  'hashicorp.com', 'databricks.com', 'snowflake.com', 'mongodb.com', 'redis.io',
  'elastic.co', 'splunk.com', 'datadoghq.com', 'newrelic.com', 'dynatrace.com',
  'pagerduty.com', 'opsgenie.com', 'victorops.com', 'sumo logic.com', 'loggly.com',
  'papertrailapp.com', 'logentries.com', 'logz.io', 'humio.com', 'coralogix.com',
  'grafana.com', 'prometheus.io', 'influxdata.com', 'timescale.com', 'questdb.io',
  'citusdata.com', 'cockroachlabs.com', 'yugabyte.com', 'planetscale.com', 'vitess.io',
  'supabase.com', 'firebase.google.com', 'realm.io', 'couchbase.com', 'arangodb.com',
  'neo4j.com', 'orientdb.com', 'arangodb.com', 'dgraph.io', 'fauna.com',
  'planetscale.com', 'neon.tech', 'turso.tech', 'libsql.org', 'duckdb.org',

  // More Cloud & Infrastructure
  'ovh.com', 'ovhcloud.com', 'hetzner.com', 'contabo.com', 'ionos.com',
  'inmotionhosting.com', 'hostinger.com', 'siteground.com', 'a2hosting.com', 'hostpapa.com',
  'greengeeks.com', 'inmotionhosting.com', 'hostgator.com', 'ipage.com', 'justhost.com',
  'fatcow.com', 'hostmonster.com', 'webhostingpad.com', 'web.com', '1and1.com',
  'ionos.com', 'tsohost.co.uk', 'memset.com', 'rackspace.com', 'joyent.com',
  'packet.com', 'scaleway.com', 'online.net', 'kimsufi.com', 'soyoustart.com',
  'runabove.com', 'ovh.ie', 'ovh.co.uk', 'ovh.de', 'ovh.es',
  'ovh.it', 'ovh.pl', 'ovh.fr', 'ovh.ca', 'ovh.com.au',

  // Software Development Tools
  'jetbrains.com', 'jetbrains.net', 'intellij.com', 'webstorm.com', 'pycharm.com',
  'phpstorm.com', 'rubymine.com', 'goland.com', 'clion.com', 'datagrip.com',
  'appcode.com', 'rider.com', 'resharper.com', 'kotlin.com', 'kotlinlang.org',
  'gradle.org', 'maven.org', 'ant.apache.org', 'ivy.apache.org', 'sbt-lang.org',
  'sbt.com', 'leiningen.org', 'boot-clj.com', 'gradle.com', 'gradle.org',
  'npmjs.com', 'yarnpkg.com', 'pnpm.io', 'deno.land', 'deno.com',
  'bun.sh', 'bun.dev', 'nodejs.org', 'iojs.org', 'esbuild.github.io',
  'vitejs.dev', 'rollupjs.org', 'webpack.js.org', 'parceljs.org', 'snowpack.dev',
  'turbo.build', 'turborepo.com', 'nx.dev', 'lerna.js.org', 'rushjs.io',
  'bazel.build', 'buck.build', 'pants.build', 'please.build', 'please.build',

  // Code Hosting & CI/CD
  'sourceforge.net', 'sourceforge.com', 'codeberg.org', 'forgejo.org', 'gitea.io',
  'gogs.io', 'gitea.com', 'forgejo.com', 'notabug.org', 'pagure.io',
  'phabricator.org', 'phacility.com', 'reviewboard.org', 'gerritcodereview.com',
  'rhodecode.com', 'allura.apache.org', 'fossil-scm.org', 'fossil-scm.com',
  'circleci.com', 'travis-ci.com', 'jenkins.io', 'jenkins-ci.org', 'bamboo.atlassian.com',
  'teamcity.jetbrains.com', 'gitlab.com', 'github.com', 'bitbucket.org', 'azure.com',
  'codefresh.io', 'spinnaker.io', 'argo-cd.readthedocs.io', 'fluxcd.io', 'tekton.dev',
  'drone.io', 'woodpecker-ci.org', 'buildkite.com', 'semaphoreci.com', 'appveyor.com',
  'buddy.works', 'bitrise.io', 'codemagic.io', 'nevercode.io', 'fastlane.tools',

  // Package Managers & Repositories
  'nuget.org', 'chocolatey.org', 'scoop.sh', 'winget.run', 'homebrew.sh',
  'brew.sh', 'macports.org', 'finkproject.org', 'pkgsrc.org', 'nixos.org',
  'guix.org', 'snapcraft.io', 'flatpak.org', 'appimage.org', 'portableapps.com',
  'piwigo.org', 'wordpress.org', 'drupal.org', 'joomla.org', 'typo3.org',
  'magento.com', 'prestashop.com', 'opencart.com', 'woocommerce.com', 'bigcommerce.com',
  'shopify.com', 'squarespace.com', 'wix.com', 'weebly.com', 'godaddy.com',

  // More E-Commerce Platforms
  'ecwid.com', 'bigcartel.com', 'volusion.com', '3dcart.com', 'shift4shop.com',
  'sellfy.com', 'gumroad.com', 'teespring.com', 'redbubble.com', 'society6.com',
  'threadless.com', 'zazzle.com', 'cafepress.com', 'printful.com', 'printify.com',
  'spreadshirt.com', 'designbyhumans.com', 'teepublic.com', 'teezily.com', 'spring.com',
  'useful-gadgets.com', 'gearbubble.com', 'sunfrog.com', 'sunfrogshirts.com', 'snaptee.me',

  // Fashion & Retail (Expanded)
  'asos.com', 'boohoo.com', 'prettylittlething.com', 'missguided.com', 'na-kd.com',
  'zaful.com', 'romwe.com', 'dresslily.com', 'chicwish.com', 'rosegal.com',
  'sammydress.com', 'choies.com', 'modcloth.com', 'stitchfix.com', 'renttherunway.com',
  'trunkclub.com', 'dailylook.com', 'frankandoak.com', 'everlane.com', 'reformation.com',
  'allbirds.com', 'rothys.com', 'birdies.com', 'vans.com', 'converse.com',
  'puma.com', 'reebok.com', 'newbalance.com', 'saucony.com', 'brooksrunning.com',
  'asics.com', 'mizuno.com', 'salomon.com', 'merrell.com', 'keenfootwear.com',
  'columbia.com', 'patagonia.com', 'thenorthface.com', 'arcteryx.com', 'marmot.com',
  'mountainhardwear.com', 'outdoorresearch.com', 'rei.com', 'backcountry.com', 'moosejaw.com',
  'steepandcheap.com', 'theclymb.com', 'sierratradingpost.com', 'campmor.com', 'eddiebauer.com',
  'llbean.com', 'landsend.com', 'duluthtrading.com', 'carhartt.com', 'dickies.com',
  'wrangler.com', 'lee.com', 'wrangler.com', 'levi.com', 'true-religion.com',

  // Beauty & Cosmetics (Expanded)
  'ulta.com', 'sephora.com', 'macys.com', 'bloomingdales.com', 'nordstrom.com',
  'neimanmarcus.com', 'saksfifthavenue.com', 'bergdorfgoodman.com', 'barneys.com', 'net-a-porter.com',
  'mytheresa.com', 'farfetch.com', 'matchesfashion.com', 'ssense.com', 'mytheresa.com',
  '24s.com', 'luisaviaroma.com', 'fwrd.com', 'theoutnet.com', 'yoox.com',
  'modaoperandi.com', 'fashionphile.com', 'vestiairecollective.com', 'therealreal.com', 'rebag.com',
  'glossier.com', 'fentybeauty.com', 'rarebeauty.com', 'milkmakeup.com', 'kosas.com',
  'il makiage.com', 'patrickta.com', 'hudabeauty.com', 'morphe.com', 'colourpop.com',
  'elfcosmetics.com', 'wetnwildbeauty.com', 'maybelline.com', 'loreal.com', 'revlon.com',
  'covergirl.com', 'rimmellondon.com', 'maxfactor.com', 'bourjois-paris.com', 'essence.eu',
  'catrice.com', 'nyxcosmetics.com', 'ulta.com', 'sephora.com', 'ulta.com',

  // Home Improvement & DIY
  'homedepot.com', 'lowes.com', 'menards.com', 'acehardware.com', 'truevalue.com',
  'northerntool.com', 'harborfreight.com', 'grainger.com', 'fastenal.com', 'mcmaster.com',
  'mscdirect.com', 'zoro.com', 'globalindustrial.com', 'uline.com', 'quill.com',
  'uline.com', 'quill.com', 'vistaprint.com', 'staples.com', 'officedepot.com',
  'walmart.com', 'target.com', 'costco.com', 'samsclub.com', 'bjswholesale.com',

  // Food & Grocery (Expanded)
  'wholefoodsmarket.com', 'sprouts.com', 'traderjoes.com', 'aldi.com', 'lidl.com',
  'publix.com', 'wegmans.com', 'heb.com', 'kroger.com', 'safeway.com',
  'albertsons.com', 'vons.com', 'ralphs.com', 'fredmeyer.com', 'frys.com',
  'qfc.com', 'kingsoopers.com', 'dillons.com', 'bakers.com', 'food4less.com',
  'foodlion.com', 'harristeeter.com', 'giantfood.com', 'stopandshop.com', 'gianteagle.com',
  'meijer.com', 'hy-vee.com', 'pricechopper.com', 'marketbasket.com', 'shoprite.com',
  'wegmans.com', 'stewleonards.com', 'fairwaymarket.com', 'dekalb farmersmarket.com', 'eataly.com',

  // Restaurants & Fast Food Chains
  'mcdonalds.com', 'burgerking.com', 'wendys.com', 'tacobell.com', 'kfc.com',
  'pizzahut.com', 'dominos.com', 'papajohns.com', 'littlecaesars.com', 'papa murphys.com',
  'subway.com', 'jimmyjohns.com', 'quiznos.com', 'potbelly.com', 'jerseymikes.com',
  'firehouse subs.com', 'pennstation.com', 'schlotzskys.com', 'whichwich.com', 'tubby subs.com',
  'arbys.com', 'hardees.com', 'jackinthebox.com', 'sonicdrivein.com', 'a&w.com',
  'dairyqueen.com', 'baskinrobbins.com', 'coldstone.com', 'carvel.com', 'friendlys.com',
  'ihop.com', 'dennys.com', 'wafflehouse.com', 'perkins.com', 'villageinn.com',
  'bobevans.com', 'crackerbarrel.com', 'olivegarden.com', 'redlobster.com', 'outback.com',
  'texasroadhouse.com', 'longhornsteakhouse.com', 'bonefishgrill.com', 'carrabbas.com', 'flemmings.com',
  'chipotle.com', 'qdoba.com', 'moe southwesterngrill.com', 'baja fresh.com', 'rubios.com',
  'panera.com', 'cornerbakery.com', 'einsteinbros.com', 'brueggers.com', 'timhortons.com',
  'dunkindonuts.com', 'krispykreme.com', 'starbucks.com', 'peets.com', 'cariboucoffee.com',

  // Travel & Tourism (Expanded)
  'expedia.com', 'priceline.com', 'kayak.com', 'orbitz.com', 'travelocity.com',
  'cheaptickets.com', 'hotwire.com', 'trivago.com', 'hotels.com', 'booking.com',
  'agoda.com', 'tripadvisor.com', 'airbnb.com', 'vrbo.com', 'homeaway.com',
  'flipkey.com', 'onefinestay.com', 'sonder.com', 'splinterstay.com', 'sykescottages.co.uk',
  'cottages.com', 'ruralretreats.co.uk', 'gites-de-france.com', 'gites.com', 'gite.com',
  'uniqlo.com', 'zara.com', 'h&m.com', 'forever21.com', 'urbanoutfitters.com',
  'anthropologie.com', 'freepeople.com', 'madewell.com', 'jcrew.com', 'bananarepublic.com',
  'gap.com', 'oldnavy.com', 'athleta.com', 'lululemon.com', 'fabletics.com',

  // Streaming & Entertainment (Expanded)
  'netflix.com', 'hulu.com', 'disney.com', 'disneyplus.com', 'hbo.com',
  'hbonow.com', 'max.com', 'paramountplus.com', 'peacocktv.com', 'appletv.com',
  'amazon.com', 'primevideo.com', 'amazon primevideo.com', 'amazon.com', 'primevideo.com',
  'cbs.com', 'cbsallaccess.com', 'paramount.com', 'showtime.com', 'showtimeanytime.com',
  'starz.com', 'starzplay.com', 'cinemax.com', 'cinemaxgo.com', 'fxnow.com',
  'amc.com', 'amcplus.com', 'shudder.com', 'ifc.com', 'sundance.com',
  'sundance now.com', 'acorn.tv', 'britbox.com', 'mhzchoice.com', 'pbs.org',
  'pbskids.org', 'pbslearningmedia.org', 'kcts9.org', 'wgbh.org', 'weta.org',
  'kqed.org', 'wnet.org', 'wttw.com', 'wbur.org', 'npr.org',

  // Music Streaming (Expanded)
  'spotify.com', 'apple.com', 'music.apple.com', 'itunes.apple.com', 'pandora.com',
  'iheart.com', 'tunein.com', 'radiocom', 'iheartradio.com', 'audacy.com',
  'entercom.com', 'cumulus.com', 'beasleybroadcasting.com', 'salemmedia.com', 'townsquaremedia.com',
  'tidal.com', 'deezer.com', 'soundcloud.com', 'bandcamp.com', 'amazon.com',
  'music.amazon.com', 'youtube.com', 'youtube music.com', 'youtube premium.com', 'youtube tv.com',
  'napster.com', 'qobuz.com', 'primephonic.com', 'idagio.com', 'classicfm.com',

  // Gaming Platforms & Stores
  'steam.com', 'steampowered.com', 'epicgames.com', 'epicstore.com', 'gog.com',
  'gog.com', 'gog galaxy.com', 'itch.io', 'gamejolt.com', 'indiedb.com',
  'moddb.com', 'nexusmods.com', 'curseforge.com', 'mod.io', 'steam workshop.com',
  'xbox.com', 'xbox live.com', 'xbox gamepass.com', 'xbox cloudgaming.com', 'bethesda.net',
  'playstation.com', 'playstation store.com', 'playstation plus.com', 'playstation now.com', 'playstation network.com',
  'nintendo.com', 'nintendo eshop.com', 'nintendo switch.com', 'nintendo 3ds.com', 'nintendo wiiu.com',
  'origin.com', 'ea.com', 'eagames.com', 'battle.net', 'blizzard.com',
  'activision.com', 'callofduty.com', 'ubisoft.com', 'ubisoft connect.com', 'uplay.com',
  'rockstargames.com', 'socialclub.rockstargames.com', 'take-two.com', '2k.com', 'gearboxsoftware.com',
  'valvesoftware.com', 'counter-strike.net', 'dota2.com', 'teamfortress.com', 'halflife.com',
  'portal.com', 'left4dead.com', 'artifact.com', 'underlords.com', 'csgo.com',

  // More Entertainment
  'twitch.tv', 'mixer.com', 'dlive.tv', 'youtube.com', 'youtube gaming.com',
  'facebook.com', 'facebook gaming.com', 'facebook watch.com', 'facebook live.com', 'instagram.com',
  'instagram tv.com', 'instagram stories.com', 'tiktok.com', 'tiktok live.com', 'tiktok creator.com',
  'snapchat.com', 'snapchat discover.com', 'snapchat spotlight.com', 'twitter.com', 'periscope.tv',
  'vimeo.com', 'dailymotion.com', 'metacafe.com', 'vevo.com', 'vevo.com',
  'mtv.com', 'vh1.com', 'comedycentral.com', 'bet.com', 'spike.com',
  'nickelodeon.com', 'nickjr.com', 'disney channel.com', 'disney junior.com', 'disney xd.com',
  'cartoonnetwork.com', 'adultswim.com', 'boomerang.com', 'tbs.com', 'tnt.com',
  'truTV.com', 'tru.tv', 'cnn.com', 'hlntv.com', 'turner.com',

  // Health & Wellness
  'webmd.com', 'mayoclinic.org', 'healthline.com', 'nih.gov', 'who.int',
  'cdc.gov', 'fda.gov', 'medlineplus.gov', 'drugs.com', 'rxlist.com',
  'everydayhealth.com', 'health.com', 'prevention.com', 'shape.com', 'womenshealthmag.com',
  'menshealth.com', 'runnersworld.com', 'bicycling.com', 'cyclingweekly.com', 'velonews.com',
  'swimmingworldmagazine.com', 'triathlete.com', 'ironman.com', 'competitor.com', 'active.com',
  'myfitnesspal.com', 'fitbit.com', 'garmin.com', 'strava.com', 'runtastic.com',
  'endomondo.com', 'mapmyrun.com', 'mapmyride.com', 'mapmywalk.com', 'mapmyfitness.com',
  'runkeeper.com', 'nike.com', 'nikerunning.com', 'adidas.com', 'adidasrunning.com',
  'underarmour.com', 'underarmour running.com', 'reebok.com', 'reebok running.com', 'newbalance.com',

  // More Social Platforms
  'reddit.com', 'redditgifts.com', 'imgur.com', '9gag.com', '4chan.org',
  'tumblr.com', 'pinterest.com', 'flickr.com', '500px.com', 'vsco.co',
  'deviantart.com', 'artstation.com', 'behance.net', 'dribbble.com', 'designer.com',
  'creativemarket.com', 'etsy.com', 'society6.com', 'redbubble.com', 'teespring.com',
  'threadless.com', 'zazzle.com', 'cafepress.com', 'printful.com', 'printify.com',
  'spreadshirt.com', 'designbyhumans.com', 'teepublic.com', 'teezily.com', 'spring.com',
];

function matchesDomain(hostname, domain) {
  if (!hostname || !domain) return false;
  if (hostname === domain) return true;
  return hostname.endsWith('.' + domain);
}

function collectReasons(u) {
  const host = u.hostname || '';
  const reasons = [];
  // Domain/hostname checks
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) reasons.push('IP address used instead of domain');
  if ((host.match(/\./g) || []).length >= 3) reasons.push('Many subdomains');

  if (/\bxn--/i.test(host)) reasons.push('Punycode domain detected');
  // Additional URL signals to align with popup
  if (u.protocol !== 'https:') reasons.push('No HTTPS detected');
  if (u.href.includes('@')) reasons.push('`@` symbol in URL');
  if (/login|verify|update|secure|account/i.test(host + u.pathname)) reasons.push('Suspicious keywords detected');
  return reasons;
}

async function queryMLAPI(url) {
  /**
   * Query the ML API for a prediction.
   * Returns: { suspicious: boolean, probability: number } or null on error
   */
  if (!ML_ENABLED) {
    log('ML API disabled');
    return null;
  }

  log('Querying ML API for:', url);

  try {
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    log('ML API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      log('ML API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    log('ML API result:', data);

    return {
      suspicious: data.suspicious || false,
      probability: data.probability || 0
    };
  } catch (error) {
    log('ML API request failed:', error.message, error.stack);
    return null; // Fail gracefully - fall back to URL heuristics
  }
}

function classifyQuick(url) {
  try {
    const u = new URL(url);
    const host = u.hostname || '';

    // Check safe dataset first - safe sites override suspicious patterns
    const isSafe = SAFE_DATASET.some(d => matchesDomain(host, d));
    if (isSafe) return { label: 'safe' };

    // Check malicious dataset second - known malicious sites are always flagged
    const inMaliciousDataset = (self._PG_MALICIOUS_DATASET || ['phishy-demo.test', 'fraud-demo.test', 'secure-verify.test', 'purplehoodie.com', 'apunkagames.com', 'apunkagames.net', 'sadeempc.com', 'crackingpatching.com', 'oceanofgames.com', 'empresstorrents.com', 'blackboxrepacke.com']).some(d => matchesDomain(host, d));
    if (inMaliciousDataset) {
      return { label: 'malicious' };
    }

    // If not safe and not explicitly malicious, then check for suspicious URL characteristics
    const reasons = collectReasons(u);
    const suspicious = reasons.length > 0;
    if (suspicious) {
      return { label: 'suspicious' };
    }

    return { label: 'unknown' };
  } catch {
    return { label: 'suspicious' };
  }
}

async function classifyWithML(url) {
  /**
   * Hybrid classification: URL heuristics + ML prediction.
   * For suspicious/unknown sites, we query ML API to get webpage-based prediction.
   */
  const quickResult = classifyQuick(url);

  log('Quick classification result:', quickResult.label);

  // Skip ML for browser internal URLs (edge://, chrome://, etc.) - can't fetch them
  if (url.startsWith('edge://') || url.startsWith('chrome://') || url.startsWith('about:')) {
    log('Browser internal URL, skipping ML');
    return quickResult;
  }

  // If URL heuristics say it's safe or malicious, trust that (no ML needed)
  if (quickResult.label === 'safe' || quickResult.label === 'malicious') {
    log('Trusting URL heuristic result (safe/malicious), skipping ML');
    return quickResult;
  }

  // For suspicious or unknown, check ML API to add webpage content analysis
  if (quickResult.label === 'suspicious' || quickResult.label === 'unknown') {
    const mlResult = await queryMLAPI(url);

    if (mlResult) {
      log('ML result received:', mlResult);

      // ML alone can trigger suspicious flag - if ML says suspicious (probability >= 0.3), mark as suspicious
      // This allows ML to upgrade unknown -> suspicious OR keep suspicious -> suspicious
      // Both URL heuristics OR ML can mark as suspicious (either or both)
      if (mlResult.suspicious && mlResult.probability >= 0.3) {
        log('ML confirms suspicious (probability >= 0.3), marking as suspicious');
        return { label: 'suspicious', mlProbability: mlResult.probability };
      }

      // ML says it's safe with low probability (< 0.3)
      // Only downgrade from 'suspicious' to 'unknown' if ML strongly says safe
      // Don't downgrade from 'unknown' since that would require explicit safe detection
      if (!mlResult.suspicious && mlResult.probability < 0.3) {
        if (quickResult.label === 'suspicious') {
          log('ML says safe with low probability, downgrading suspicious -> unknown');
          return { label: 'unknown', mlProbability: mlResult.probability };
        }
        // If already 'unknown', ML confirms it's likely safe, but keep as 'unknown'
      }

      log('ML result in uncertain zone, keeping original classification');
    } else {
      log('ML API unavailable or failed, using URL heuristics only');
    }
  }

  return quickResult;
}

const lastLabelByTab = new Map();

async function updateTab(tabId, url, force = false) {
  if (!tabId || !url) return;

  // Use hybrid classification (URL heuristics + ML)
  const { label: quickLabel } = await classifyWithML(url);

  // Whitelist or SAFE_DATASET override (blacklist removed per new rules)
  let effectiveLabel = quickLabel;
  try {
    const u = new URL(url);
    const host = u.hostname || '';

    const { whitelist = [] } = await chrome.storage.local.get(['whitelist']);
    const matchesDomain = (hostname, domain) => {
      if (!hostname || !domain) return false;
      if (hostname === domain) return true;
      return hostname.endsWith('.' + domain);
    };
    let isWhite = whitelist.some(d => matchesDomain(host, d));
    // Also check SAFE_DATASET (from classifier.js, should be global)
    if (!isWhite && typeof self !== 'undefined' && self.SAFE_DATASET) {
      isWhite = self.SAFE_DATASET.some(d => matchesDomain(host, d));
    }
    if (isWhite) effectiveLabel = 'safe';
  } catch { }
  // Verify tab still exists before attempting updates
  try {
    const t = await chrome.tabs.get(tabId);
    if (!t) return;
  } catch {
    return;
  }
  if (force || lastLabelByTab.get(tabId) !== effectiveLabel) {
    log('update tab', tabId, effectiveLabel, url);
    await setIconFor(tabId, effectiveLabel);
    lastLabelByTab.set(tabId, effectiveLabel);
  }
  // Inject in-page UI for http/https pages
  if (/^https?:/i.test(url)) {
    try {
      const t2 = await chrome.tabs.get(tabId);
      if (!t2) return;
      if (effectiveLabel === 'malicious') {
        await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
      } else if (effectiveLabel === 'suspicious') {
        await chrome.scripting.executeScript({ target: { tabId }, files: ['content_suspicious.js'] });
      }
    } catch { }
  }
}

// Initialize all open tabs at startup / reload
async function initAll() {
  const tabs = await chrome.tabs.query({});
  for (const t of tabs) await updateTab(t.id, t.url || '', true);
  log('init complete');
}
initAll();
chrome.runtime.onInstalled.addListener(initAll);
chrome.runtime.onStartup.addListener(initAll);

// Cover ALL navigation modes:
chrome.tabs.onCreated.addListener(t => updateTab(t.id, t.url || '', true));
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const t = await chrome.tabs.get(tabId); updateTab(tabId, t?.url || '', true);
});
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (info.url) updateTab(tabId, info.url);                         // URL changed
  if (info.status === 'loading') updateTab(tabId, tab?.url || '', true);  // refresh started
  if (info.status === 'complete') updateTab(tabId, tab?.url || '', true); // refresh finished
});
// Removed webNavigation listeners due to compatibility issues; tabs.* events above cover updates

// Allow popup to force an icon
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'setIconByLabel' && msg.label) {
    const tabId = msg.tabId || sender?.tab?.id;
    if (!tabId) return;
    // Validate tab before attempting to set icon
    chrome.tabs.get(tabId, (t) => {
      if (chrome.runtime.lastError || !t) return;
      setIconFor(tabId, msg.label);
    });
  } else if (msg.type === 'pg_close_tab') {
    const tabId = sender?.tab?.id;
    if (!tabId) return;
    try { chrome.tabs.remove(tabId); } catch { }
  } else if (msg.type === 'pg_force_update_tab' && msg.tabId) {
    chrome.tabs.get(msg.tabId, (t) => {
      if (chrome.runtime.lastError || !t) return;
      updateTab(msg.tabId, t.url || '', true);
    });
  }
});
