// New logic
// Labels: 'safe' | 'unknown' | 'suspicious' | 'malicious'
// - suspicious: irregularities in hostname or URL signals
// - malicious: suspicious AND hostname equals/endsWith a domain in MALICIOUS_DATASET
// - safe: hostname equals/endsWith a known-safe domain
// - unknown: everything else
// Returns: { label: 'safe'|'unknown'|'suspicious'|'malicious', reasons: [] }

const SAFE_DATASET = [
  // Social Media & Communication
  'railway.com',
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com', 'linkedin.com',
  'reddit.com', 'pinterest.com', 'tumblr.com', 'snapchat.com', 'tiktok.com',
  'discord.com', 'telegram.org', 'whatsapp.com', 'signal.org', 'viber.com',
  'line.me', 'wechat.com', 'skype.com', 'zoom.us', 'teams.microsoft.com',
  'slack.com', 'messenger.com', 'vk.com', 'ok.ru', 'weibo.com',
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
    if ((host.match(/-/g) || []).length > 2) reasons.push('Excessive hyphens in domain');
    if (u.href.length > 75) reasons.push('URL is unusually long');

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
