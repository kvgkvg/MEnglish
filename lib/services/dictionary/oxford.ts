/**
 * Oxford Learner's Dictionary Service
 *
 * Fetches precise definitions from Oxford Learner's Dictionaries.
 */

export interface OxfordDefinition {
  word: string;
  definition: string;
  example_sentence: string | null;
  partOfSpeech: string | null;
  found: boolean;
}

/**
 * Fetch definition from Oxford Learner's Dictionary
 */
export async function fetchOxfordDefinition(word: string): Promise<OxfordDefinition> {
  const cleanWord = word.toLowerCase().trim().replace(/\s+/g, '-');
  const url = `https://www.oxfordlearnersdictionaries.com/definition/english/${cleanWord}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) {
      return { word, definition: '', example_sentence: null, partOfSpeech: null, found: false };
    }

    const html = await response.text();

    // Parse the HTML to extract definition and example
    const result = parseOxfordHTML(html, word);
    return result;
  } catch (error) {
    console.error(`Failed to fetch Oxford definition for "${word}":`, error);
    return { word, definition: '', example_sentence: null, partOfSpeech: null, found: false };
  }
}

/**
 * Parse Oxford dictionary HTML to extract definition and example
 */
function parseOxfordHTML(html: string, word: string): OxfordDefinition {
  try {
    // Extract part of speech
    const posMatch = html.match(/<span class="pos"[^>]*>([^<]+)<\/span>/);
    const partOfSpeech = posMatch ? posMatch[1].trim() : null;

    // Extract definition - look for the first sense definition
    // Oxford uses class "def" for definitions
    const defMatch = html.match(/<span class="def"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>)*[^<]*)<\/span>/);
    let definition = '';

    if (defMatch) {
      // Clean HTML tags from definition
      definition = defMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Try alternative definition patterns if first didn't work
    if (!definition) {
      const altDefMatch = html.match(/class="def"[^>]*>([^<]+)/);
      if (altDefMatch) {
        definition = altDefMatch[1].trim();
      }
    }

    // Extract example sentence
    // Oxford uses class "x" for examples
    const exampleMatch = html.match(/<span class="x"[^>]*>([^<]+(?:<[^>]+>[^<]*<\/[^>]+>)*[^<]*)<\/span>/);
    let example_sentence = null;

    if (exampleMatch) {
      example_sentence = exampleMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // If no definition found, return not found
    if (!definition) {
      return { word, definition: '', example_sentence: null, partOfSpeech: null, found: false };
    }

    // Add part of speech to definition if available
    const fullDefinition = partOfSpeech
      ? `(${partOfSpeech}) ${definition}`
      : definition;

    return {
      word,
      definition: fullDefinition,
      example_sentence,
      partOfSpeech,
      found: true,
    };
  } catch (error) {
    console.error(`Failed to parse Oxford HTML for "${word}":`, error);
    return { word, definition: '', example_sentence: null, partOfSpeech: null, found: false };
  }
}

/**
 * Batch fetch definitions for multiple words
 * Returns a map of word -> definition
 */
export async function fetchOxfordDefinitions(
  words: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, OxfordDefinition>> {
  const results = new Map<string, OxfordDefinition>();

  // Process words with concurrency limit to avoid overwhelming the server
  const BATCH_SIZE = 3;
  const DELAY_MS = 500; // Delay between batches to be respectful

  for (let i = 0; i < words.length; i += BATCH_SIZE) {
    const batch = words.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(word => fetchOxfordDefinition(word))
    );

    batchResults.forEach(result => {
      results.set(result.word.toLowerCase(), result);
    });

    if (onProgress) {
      onProgress(Math.min(i + BATCH_SIZE, words.length), words.length);
    }

    // Add delay between batches (except for last batch)
    if (i + BATCH_SIZE < words.length) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  return results;
}
