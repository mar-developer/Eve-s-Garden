/**
 * Letter-to-animal mapping for the learning system.
 * Each letter A-Z has a signature animal with model, sound, and display name.
 */

export interface AnimalEntry {
  letter: string;
  name: string;
  model: string; // path to GLB under /models/animals/
  sound: string; // path to audio under /sounds/animals/
}

/** Full 26-letter animal registry from the blueprint */
export const ANIMAL_REGISTRY: Record<string, AnimalEntry> = {
  A: { letter: 'A', name: 'Alligator', model: '/models/animals/alligator.glb', sound: '/sounds/animals/chomp.mp3' },
  B: { letter: 'B', name: 'Bear', model: '/models/animals/bear.glb', sound: '/sounds/animals/growl.mp3' },
  C: { letter: 'C', name: 'Cat', model: '/models/animals/cat.glb', sound: '/sounds/animals/meow.mp3' },
  D: { letter: 'D', name: 'Dog', model: '/models/animals/dog.glb', sound: '/sounds/animals/woof.mp3' },
  E: { letter: 'E', name: 'Elephant', model: '/models/animals/elephant.glb', sound: '/sounds/animals/trumpet.mp3' },
  F: { letter: 'F', name: 'Frog', model: '/models/animals/frog.glb', sound: '/sounds/animals/ribbit.mp3' },
  G: { letter: 'G', name: 'Giraffe', model: '/models/animals/giraffe.glb', sound: '/sounds/animals/hum.mp3' },
  H: { letter: 'H', name: 'Horse', model: '/models/animals/horse.glb', sound: '/sounds/animals/neigh.mp3' },
  I: { letter: 'I', name: 'Iguana', model: '/models/animals/iguana.glb', sound: '/sounds/animals/hiss.mp3' },
  J: { letter: 'J', name: 'Jellyfish', model: '/models/animals/jellyfish.glb', sound: '/sounds/animals/bloop.mp3' },
  K: { letter: 'K', name: 'Koala', model: '/models/animals/koala.glb', sound: '/sounds/animals/chirp.mp3' },
  L: { letter: 'L', name: 'Lion', model: '/models/animals/lion.glb', sound: '/sounds/animals/roar.mp3' },
  M: { letter: 'M', name: 'Monkey', model: '/models/animals/monkey.glb', sound: '/sounds/animals/ooh.mp3' },
  N: { letter: 'N', name: 'Narwhal', model: '/models/animals/narwhal.glb', sound: '/sounds/animals/splash.mp3' },
  O: { letter: 'O', name: 'Owl', model: '/models/animals/owl.glb', sound: '/sounds/animals/hoot.mp3' },
  P: { letter: 'P', name: 'Penguin', model: '/models/animals/penguin.glb', sound: '/sounds/animals/squawk.mp3' },
  Q: { letter: 'Q', name: 'Quail', model: '/models/animals/quail.glb', sound: '/sounds/animals/tweet.mp3' },
  R: { letter: 'R', name: 'Rabbit', model: '/models/animals/rabbit.glb', sound: '/sounds/animals/squeak.mp3' },
  S: { letter: 'S', name: 'Snake', model: '/models/animals/snake.glb', sound: '/sounds/animals/hiss-silly.mp3' },
  T: { letter: 'T', name: 'Turtle', model: '/models/animals/turtle.glb', sound: '/sounds/animals/pop.mp3' },
  U: { letter: 'U', name: 'Unicorn', model: '/models/animals/unicorn.glb', sound: '/sounds/animals/sparkle.mp3' },
  V: { letter: 'V', name: 'Vulture', model: '/models/animals/vulture.glb', sound: '/sounds/animals/caw.mp3' },
  W: { letter: 'W', name: 'Whale', model: '/models/animals/whale.glb', sound: '/sounds/animals/song.mp3' },
  X: { letter: 'X', name: 'X-ray Fish', model: '/models/animals/xrayfish.glb', sound: '/sounds/animals/bubble.mp3' },
  Y: { letter: 'Y', name: 'Yak', model: '/models/animals/yak.glb', sound: '/sounds/animals/grunt.mp3' },
  Z: { letter: 'Z', name: 'Zebra', model: '/models/animals/zebra.glb', sound: '/sounds/animals/whinny.mp3' },
};

/** Get the animal for a given letter (uppercase). Returns undefined for non-letter chars. */
export function getAnimalForLetter(letter: string): AnimalEntry | undefined {
  return ANIMAL_REGISTRY[letter.toUpperCase()];
}

/** Pre-loaded word suggestion sets */
export const WORD_SUGGESTIONS: Record<string, string[]> = {
  Animals: ['CAT', 'DOG', 'FISH', 'BEAR'],
  Colors: ['RED', 'BLUE', 'GREEN'],
  Family: ['MOM', 'DAD', 'BABY'],
  Food: ['APPLE', 'CAKE', 'MILK'],
  Fun: ['PLAY', 'JUMP', 'STAR'],
};
