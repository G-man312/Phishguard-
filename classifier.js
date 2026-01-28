// New logic
// Labels: 'safe' | 'unknown' | 'suspicious' | 'malicious'
// - suspicious: irregularities in hostname or URL signals
// - malicious: suspicious AND hostname equals/endsWith a domain in MALICIOUS_DATASET
// - safe: hostname equals/endsWith a known-safe domain
// - unknown: everything else
// Returns: { label: 'safe'|'unknown'|'suspicious'|'malicious', reasons: [] }

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

// Make SAFE_DATASET available globally for background and popup scripts
if (typeof self !== 'undefined') self.SAFE_DATASET = SAFE_DATASET;
if (typeof window !== 'undefined') window.SAFE_DATASET = SAFE_DATASET;

const MALICIOUS_DATASET = [
  'phishy-demo.test',
  'fraud-demo.test',
  'secure-verify.test',
  'purplehoodie.com',
  'apunkagames.com',
  'apunkagames.net',
  'sadeempc.com',
  'crackingpatching.com',
  'oceanofgames.com',
  'empresstorrents.com',
  'blackboxrepacke.com',
  'testsafebrowsing.appspot.com'
];

function matchesDomain(hostname, domain) {
  if (!hostname || !domain) return false;
  if (hostname === domain) return true;
  return hostname.endsWith('.' + domain);
}

function isHostnameSuspicious(hostname, reasons) {
  let any = false;
  // IP literal used as hostname
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) { any = true; reasons.push('IP address used instead of domain'); }
  // Many subdomains (>= 3 dots → 4+ labels)
  if ((hostname.match(/\./g) || []).length >= 3) { any = true; reasons.push('Many subdomains'); }
  // Hyphen in registered domain/labels (removed as suspicious)
  // Punycode/IDN indicator
  if (/\bxn--/i.test(hostname)) { any = true; reasons.push('Punycode domain detected'); }
  return any;
}

function classifyUrlQuick(urlString) {
  try {
    const u = new URL(urlString);
    const host = u.hostname || '';

    // Check safe dataset first - safe sites override suspicious patterns
    const isSafe = SAFE_DATASET.some(d => matchesDomain(host, d));
    if (isSafe) return { label: 'safe', reasons: [] };

    // Check malicious dataset second - known malicious sites are always flagged
    const inMaliciousDataset = MALICIOUS_DATASET.some(d => matchesDomain(host, d));
    if (inMaliciousDataset) {
      // Collect reasons for display, but label is always malicious
      const reasons = [];
      isHostnameSuspicious(host, reasons);
      // if (u.protocol !== 'https:') reasons.push('No HTTPS detected');
      if (u.href.includes('@')) reasons.push('`@` symbol in URL');
      if (/login|verify|update|secure|account/i.test(host + u.pathname)) reasons.push('Suspicious keywords detected');
      return { label: 'malicious', reasons: [...reasons, 'Domain is present in known-malicious dataset'] };
    }

    // If not safe and not explicitly malicious, then check for suspicious URL characteristics
    const reasons = [];

    // 1. Domain/hostname irregularities
    isHostnameSuspicious(host, reasons);

    // 2. Brand Misuse Detection (Targeted Brand Spoofing)
    // We check if the hostname *contains* a high-value target brand but is NOT that brand's legitimate domain.
    // This catches 'paypal-secure.com', 'google-login.net', 'netflix-update.org' etc.
    const TARGET_BRANDS = [
      { name: 'PayPal', domain: 'paypal.com' },
      { name: 'Google', domain: 'google.com' },
      { name: 'Microsoft', domain: 'microsoft.com' },
      { name: 'Apple', domain: 'apple.com' },
      { name: 'Amazon', domain: 'amazon.com' },
      { name: 'Netflix', domain: 'netflix.com' },
      { name: 'Facebook', domain: 'facebook.com' },
      { name: 'Instagram', domain: 'instagram.com' },
      { name: 'Bank of America', domain: 'bankofamerica.com' },
      { name: 'Chase', domain: 'chase.com' },
      { name: 'Wells Fargo', domain: 'wellsfargo.com' }
    ];

    for (const brand of TARGET_BRANDS) {
      // If hostname contains the brand name (e.g. "paypal")
      if (host.includes(brand.name.toLowerCase().replace(/\s/g, ''))) {
        // But ensures it's NOT the official domain (e.g. paypal.com)
        if (!matchesDomain(host, brand.domain)) {
          reasons.push(`Brand name misuse detected: "${brand.name}"`);
          break; // Report the first clear violation
        }
      }
    }

    // 3. Additional Signals
    if (u.protocol !== 'https:') reasons.push('No HTTPS details detected (Not Secure)');
    if (u.href.includes('@')) reasons.push('`@` symbol in URL (Authentication bypass attempt)');
    if (/login|verify|update|secure|account|bank|signin|confirm/i.test(host + u.pathname)) reasons.push('Suspicious sensitive keywords detected');

    // 4. Risky Top-Level Domains (TLDs)
    // These TLDs are frequently abused by phishing campaigns due to low cost/availability
    const RISKY_TLDS = ['.xyz', '.top', '.pw', '.tk', '.ml', '.ga', '.cf', '.gq', '.cn', '.ru', '.rest', '.buzz', '.fit'];
    if (RISKY_TLDS.some(tld => host.endsWith(tld))) {
      reasons.push('Domain uses a specialized TLD often associated with spam/abuse');
    }

    // 5. Non-Standard Ports
    // Phishing sites often host on ports like 8000, 8080, 8443 to bypass standard filters
    if (u.port && u.port !== '80' && u.port !== '443') {
      reasons.push(`URL uses non-standard port (${u.port})`);
    }

    // 6. Suspicious Extensions in Hostname
    // e.g. "secure-login.php.com" or ending hostname with file extension
    if (/\.(php|html|htm|exe|apk|bat|cmd|sh)$/i.test(host)) {
      reasons.push('Hostname ends with a file extension (Deceptive naming)');
    }

    // 7. Structural Anomalies
    if (host.length > 50) reasons.push('Abnormally long domain name');


    if (reasons.length > 0) {
      return { label: 'suspicious', reasons };
    }

    return { label: 'unknown', reasons: [] };
  } catch {
    return { label: 'suspicious', reasons: ['Invalid URL format'] };
  }
}

// Expose to popup.js
window.classifyUrlQuick = classifyUrlQuick;
window._PG_SAFE_DATASET = SAFE_DATASET;
window._PG_MALICIOUS_DATASET = MALICIOUS_DATASET;
