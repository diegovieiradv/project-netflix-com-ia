import {
    getYouTubeId,
    sanitizeString,
    seededRandom,
    getMatchScore,
    getDuration,
    getGenreColor,
} from '../js/utils.js';

// Simple test runner
let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (!condition) {
        console.error(`FAIL: ${message}`);
        failed++;
    } else {
        console.log(`PASS: ${message}`);
        passed++;
    }
}

// --- getYouTubeId ---
assert(
    getYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ') === 'dQw4w9WgXcQ',
    'Extract YouTube ID from watch URL'
);
assert(
    getYouTubeId('https://youtu.be/dQw4w9WgXcQ') === 'dQw4w9WgXcQ',
    'Extract YouTube ID from short URL'
);
assert(getYouTubeId('invalid') === '7RUA0IOfar8', 'Return default ID for invalid URL');
assert(getYouTubeId('') === '7RUA0IOfar8', 'Return default ID for empty URL');

// --- sanitizeString ---
assert(
    sanitizeString('<script>alert("xss")</script>') ===
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
    'Sanitize HTML tags'
);
assert(
    sanitizeString('Hello & "World"') === 'Hello &amp; &quot;World&quot;',
    'Sanitize ampersand and quotes'
);
assert(sanitizeString(123) === '', 'Return empty string for non-string input');

// --- seededRandom ---
assert(typeof seededRandom('test') === 'number', 'Return number');
assert(seededRandom('test') === seededRandom('test'), 'Same seed returns same value');
assert(seededRandom('test') !== seededRandom('test2'), 'Different seeds return different values');

// --- getMatchScore ---
assert(
    getMatchScore('Test Movie') >= 70 && getMatchScore('Test Movie') <= 99,
    'Score between 70-99'
);
assert(getMatchScore('Test Movie') === getMatchScore('Test Movie'), 'Deterministic score');

// --- getDuration ---
assert(getDuration({ title: 'Test' }).includes('h'), 'Duration contains hours');
assert(getDuration({ progress: 50 }) === '10 temporadas', 'Series shows seasons');

// --- getGenreColor ---
assert(getGenreColor('Ação') === '#E50914', 'Action genre color');
assert(getGenreColor('Unknown') === '#666', 'Default color for unknown genre');

// --- Summary ---
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) {
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
}
