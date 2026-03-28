require('dotenv').config();
const snoowrap = require('snoowrap');
const cron = require('node-cron');

const WEBSITE_URL = "https://pumplab-frontend.vercel.app/";

// --- SETUP REDDIT API ---
// Grab these for free from reddit.com/prefs/apps
const reddit = new snoowrap({
    userAgent: 'PumpLab Growth Bot v1.0 (by /u/YourRedditUsername)',
    clientId: process.env.REDDIT_CLIENT_ID,
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
});

const TARGET_SUBREDDITS = ['solana', 'CryptoCurrency', 'memecoins'];
const KEYWORDS = ['rugged', 'scammed', 'best scanner', 'dextools', 'lagging'];

async function scanReddit() {
    console.log("[Growth-Engine] Starting Reddit Scan...");
    
    try {
        for (const sub of TARGET_SUBREDDITS) {
            // Pull the 15 newest posts from each subreddit
            const newPosts = await reddit.getSubreddit(sub).getNew({ limit: 15 });
            
            for (const post of newPosts) {
                const text = (post.title + " " + post.selftext).toLowerCase();
                const match = KEYWORDS.some(kw => text.includes(kw));
                
                // If it matches our keywords and we haven't saved/replied to it yet
                if (match && !post.saved) {
                    console.log(`[Reddit] Target acquired in r/${sub}: ${post.title}`);
                    
                    const replyText = `honestly the latency on standard charts is what gets most people rekt on sol. i got tired of the slow updates and hidden dev wallets so i built a free dashboard that checks the lp lock and contract authorities in real-time. \n\nyou can use the terminal here: ${WEBSITE_URL} \n\nit's rough around the edges but it's helped me avoid a ton of honeypots lately. stay safe out there.`;
                    
                    await post.reply(replyText);
                    await post.save(); // Mark as handled
                    console.log("[Reddit] Dev-pill dropped successfully.");
                    
                    // Sleep for 3 minutes to avoid Reddit's spam filters
                    await new Promise(r => setTimeout(r, 180000)); 
                }
            }
        }
        console.log("[Growth-Engine] Reddit scan complete. Sleeping.");
    } catch (err) {
        console.error("[Reddit Error]", err.message);
    }
}

console.log("🚀 PumpLab Reddit Engine Activated");

// Run every 2 hours
cron.schedule('0 */2 * * *', () => {
    scanReddit();
});