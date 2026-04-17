import { getStreamContent } from './src/extractor';
import { AnimeUnityProvider } from './src/providers/animeunity-provider';
import { AnimeSaturnProvider } from './src/providers/animesaturn-provider';
import { AnimeWorldProvider } from './src/providers/animeworld-provider';
import { getGuardoserieStreams } from './src/providers/guardoserie';
import { getGuardaflixStreams } from './src/providers/guardaflix';

process.env.TMDB_API_KEY = '40a9faa1f6741afb2c0c40238d85f8d0';

async function testVixSrc() {
    console.log('\n--- Testing VixSrc (StreamingCommunity) ---');
    try {
        const results = await getStreamContent('tt1190634:1:1', 'series', { 
            vixDirect: true, 
            vixDirectFhd: true,
            addonBase: 'http://localhost:7860',
            tmdbApiKey: process.env.TMDB_API_KEY
        });
        console.log(`VixSrc: Found ${results?.length || 0} streams`);
        results?.slice(0, 2).forEach(s => console.log(` - [${s.source}] ${s.name}: ${s.streamUrl.substring(0, 100)}...`));
    } catch (e: any) {
        console.error('VixSrc Error:', e.message);
    }
}

async function testAnimeUnity() {
    console.log('\n--- Testing AnimeUnity ---');
    try {
        const provider = new AnimeUnityProvider({ enabled: true, animeunityDirect: true, animeunityDirectFhd: true });
        const results = await provider.handleKitsuRequest('kitsu:7442:1:1');
        console.log(`AnimeUnity: Found ${results.streams?.length || 0} streams`);
        results.streams?.slice(0, 2).forEach(s => console.log(` - ${s.title}: ${s.url.substring(0, 100)}...`));
    } catch (e: any) {
        console.error('AnimeUnity Error:', e.message);
    }
}

async function testAnimeSaturn() {
    console.log('\n--- Testing AnimeSaturn ---');
    try {
        const provider = new AnimeSaturnProvider({ enabled: true });
        const results = await provider.handleKitsuRequest('kitsu:7442:1:1');
        console.log(`AnimeSaturn: Found ${results.streams?.length || 0} streams`);
        results.streams?.slice(0, 2).forEach(s => console.log(` - ${s.title}: ${s.url.substring(0, 100)}...`));
    } catch (e: any) {
        console.error('AnimeSaturn Error:', e.message);
    }
}

async function testAnimeWorld() {
    console.log('\n--- Testing AnimeWorld ---');
    try {
        const provider = new AnimeWorldProvider({ enabled: true });
        const results = await provider.handleKitsuRequest('kitsu:7442:1:1');
        console.log(`AnimeWorld: Found ${results.streams?.length || 0} streams`);
        results.streams?.slice(0, 2).forEach(s => console.log(` - ${s.title}: ${s.url.substring(0, 100)}...`));
    } catch (e: any) {
        console.error('AnimeWorld Error:', e.message);
    }
}

async function testGuardoserie() {
    console.log('\n--- Testing Guardoserie (New) ---');
    try {
        const results = await getGuardoserieStreams('series', 'tt1190634:1:1', process.env.TMDB_API_KEY); // The Boys
        console.log(`Guardoserie: Found ${results?.length || 0} streams`);
        results?.slice(0, 2).forEach(s => console.log(` - ${s.title}: ${s.url.substring(0, 100)}...`));
    } catch (e: any) {
        console.error('Guardoserie Error:', e.message);
    }
}

async function testGuardaflix() {
    console.log('\n--- Testing Guardaflix ---');
    try {
        const results = await getGuardaflixStreams('movie', 'tt0816692'); // Inception
        console.log(`Guardaflix: Found ${results?.length || 0} streams`);
        results?.slice(0, 2).forEach(s => console.log(` - ${s.title}: ${s.url.substring(0, 100)}...`));
    } catch (e: any) {
        console.error('Guardaflix Error:', e.message);
    }
}

async function runAllTests() {
    console.log('Starting source validation...');
    await testVixSrc();
    await testAnimeUnity();
    await testAnimeSaturn();
    await testAnimeWorld();
    await testGuardoserie();
    await testGuardaflix();
    console.log('\nValidation complete.');
}

runAllTests();
