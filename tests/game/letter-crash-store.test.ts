import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '@/game/stores/letter-crash-store';
import { LetterBlock } from '@/types/letter-crash';

function resetStore() {
  useGameStore.setState({
    word: '',
    dimension: 'Home',
    score: 0,
    letterBlocks: [],
    hitLetters: [],
    gamePhase: 'idle',
    isInputFocused: false,
  });
}

const makeBlock = (overrides: Partial<LetterBlock> = {}): LetterBlock => ({
  id: 'block-1',
  letter: 'A',
  position: [0, 1, 0],
  color: '#FF0000',
  spawnIndex: 0,
  ...overrides,
});

describe('useGameStore', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('initial state', () => {
    it('starts with empty word', () => {
      expect(useGameStore.getState().word).toBe('');
    });

    it('starts with Home dimension', () => {
      expect(useGameStore.getState().dimension).toBe('Home');
    });

    it('starts with score 0', () => {
      expect(useGameStore.getState().score).toBe(0);
    });

    it('starts with empty letterBlocks', () => {
      expect(useGameStore.getState().letterBlocks).toEqual([]);
    });

    it('starts with empty hitLetters', () => {
      expect(useGameStore.getState().hitLetters).toEqual([]);
    });

    it('starts with idle gamePhase', () => {
      expect(useGameStore.getState().gamePhase).toBe('idle');
    });

    it('starts with isInputFocused false', () => {
      expect(useGameStore.getState().isInputFocused).toBe(false);
    });
  });

  describe('setWord', () => {
    it('updates the word', () => {
      useGameStore.getState().setWord('HELLO');
      expect(useGameStore.getState().word).toBe('HELLO');
    });

    it('can set word to empty string', () => {
      useGameStore.getState().setWord('TEST');
      useGameStore.getState().setWord('');
      expect(useGameStore.getState().word).toBe('');
    });
  });

  describe('incrementScore', () => {
    it('increments score by 1', () => {
      useGameStore.getState().incrementScore();
      expect(useGameStore.getState().score).toBe(1);
    });

    it('increments multiple times', () => {
      useGameStore.getState().incrementScore();
      useGameStore.getState().incrementScore();
      useGameStore.getState().incrementScore();
      expect(useGameStore.getState().score).toBe(3);
    });
  });

  describe('addLetterBlock', () => {
    it('adds a block to the array', () => {
      const block = makeBlock();
      useGameStore.getState().addLetterBlock(block);
      expect(useGameStore.getState().letterBlocks).toHaveLength(1);
      expect(useGameStore.getState().letterBlocks[0]).toEqual(block);
    });

    it('adds blocks immutably (new array reference)', () => {
      const before = useGameStore.getState().letterBlocks;
      useGameStore.getState().addLetterBlock(makeBlock());
      const after = useGameStore.getState().letterBlocks;
      expect(before).not.toBe(after);
    });

    it('preserves existing blocks when adding', () => {
      const block1 = makeBlock({ id: 'b1', letter: 'A' });
      const block2 = makeBlock({ id: 'b2', letter: 'B' });
      useGameStore.getState().addLetterBlock(block1);
      useGameStore.getState().addLetterBlock(block2);
      expect(useGameStore.getState().letterBlocks).toHaveLength(2);
      expect(useGameStore.getState().letterBlocks[0].id).toBe('b1');
      expect(useGameStore.getState().letterBlocks[1].id).toBe('b2');
    });
  });

  describe('removeLetterBlock', () => {
    it('removes a block by id', () => {
      useGameStore.getState().addLetterBlock(makeBlock({ id: 'b1' }));
      useGameStore.getState().addLetterBlock(makeBlock({ id: 'b2' }));
      useGameStore.getState().removeLetterBlock('b1');
      expect(useGameStore.getState().letterBlocks).toHaveLength(1);
      expect(useGameStore.getState().letterBlocks[0].id).toBe('b2');
    });

    it('removes blocks immutably (new array reference)', () => {
      useGameStore.getState().addLetterBlock(makeBlock({ id: 'b1' }));
      const before = useGameStore.getState().letterBlocks;
      useGameStore.getState().removeLetterBlock('b1');
      const after = useGameStore.getState().letterBlocks;
      expect(before).not.toBe(after);
    });

    it('does nothing if id not found', () => {
      useGameStore.getState().addLetterBlock(makeBlock({ id: 'b1' }));
      useGameStore.getState().removeLetterBlock('nonexistent');
      expect(useGameStore.getState().letterBlocks).toHaveLength(1);
    });
  });

  describe('markLetterHit', () => {
    it('adds a HitRecord to hitLetters', () => {
      useGameStore.getState().markLetterHit('b1', 'A', 'Explosion');
      const hitLetters = useGameStore.getState().hitLetters;
      expect(hitLetters).toHaveLength(1);
      expect(hitLetters[0].letterId).toBe('b1');
      expect(hitLetters[0].letter).toBe('A');
      expect(hitLetters[0].eventType).toBe('Explosion');
      expect(hitLetters[0].timestamp).toBeGreaterThan(0);
    });

    it('adds records immutably (new array reference)', () => {
      const before = useGameStore.getState().hitLetters;
      useGameStore.getState().markLetterHit('b1', 'A', 'Stars');
      const after = useGameStore.getState().hitLetters;
      expect(before).not.toBe(after);
    });

    it('accumulates multiple hit records', () => {
      useGameStore.getState().markLetterHit('b1', 'A', 'Explosion');
      useGameStore.getState().markLetterHit('b2', 'B', 'Portal');
      expect(useGameStore.getState().hitLetters).toHaveLength(2);
    });
  });

  describe('changeDimension', () => {
    it('changes to a different dimension (not same as current)', () => {
      const before = useGameStore.getState().dimension;
      useGameStore.getState().changeDimension();
      const after = useGameStore.getState().dimension;
      expect(after).not.toBe(before);
    });

    it('always picks a valid dimension', () => {
      const validDimensions = ['Home', 'Candy', 'Space', 'Ocean', 'Volcano', 'Cloud'];
      for (let i = 0; i < 50; i++) {
        useGameStore.getState().changeDimension();
        expect(validDimensions).toContain(useGameStore.getState().dimension);
      }
    });
  });

  describe('setGamePhase', () => {
    it('sets game phase to playing', () => {
      useGameStore.getState().setGamePhase('playing');
      expect(useGameStore.getState().gamePhase).toBe('playing');
    });

    it('sets game phase to allClear', () => {
      useGameStore.getState().setGamePhase('allClear');
      expect(useGameStore.getState().gamePhase).toBe('allClear');
    });
  });

  describe('setIsInputFocused', () => {
    it('sets isInputFocused to true', () => {
      useGameStore.getState().setIsInputFocused(true);
      expect(useGameStore.getState().isInputFocused).toBe(true);
    });

    it('sets isInputFocused to false', () => {
      useGameStore.getState().setIsInputFocused(true);
      useGameStore.getState().setIsInputFocused(false);
      expect(useGameStore.getState().isInputFocused).toBe(false);
    });
  });

  describe('resetWord', () => {
    it('resets word, letterBlocks, hitLetters, and gamePhase', () => {
      useGameStore.getState().setWord('HELLO');
      useGameStore.getState().addLetterBlock(makeBlock());
      useGameStore.getState().markLetterHit('b1', 'A', 'Stars');
      useGameStore.getState().setGamePhase('playing');

      useGameStore.getState().resetWord();

      expect(useGameStore.getState().word).toBe('');
      expect(useGameStore.getState().letterBlocks).toEqual([]);
      expect(useGameStore.getState().hitLetters).toEqual([]);
      expect(useGameStore.getState().gamePhase).toBe('idle');
    });

    it('preserves dimension after resetWord', () => {
      useGameStore.getState().setDimension('Space');
      useGameStore.getState().setWord('TEST');
      useGameStore.getState().resetWord();
      expect(useGameStore.getState().dimension).toBe('Space');
    });

    it('preserves score after resetWord', () => {
      useGameStore.getState().incrementScore();
      useGameStore.getState().incrementScore();
      useGameStore.getState().resetWord();
      expect(useGameStore.getState().score).toBe(2);
    });
  });

  describe('resetGame', () => {
    it('resets word, score, letterBlocks, hitLetters, and gamePhase', () => {
      useGameStore.getState().setWord('HELLO');
      useGameStore.getState().incrementScore();
      useGameStore.getState().addLetterBlock(makeBlock());
      useGameStore.getState().markLetterHit('b1', 'A', 'Stars');
      useGameStore.getState().setGamePhase('playing');

      useGameStore.getState().resetGame();

      expect(useGameStore.getState().word).toBe('');
      expect(useGameStore.getState().score).toBe(0);
      expect(useGameStore.getState().letterBlocks).toEqual([]);
      expect(useGameStore.getState().hitLetters).toEqual([]);
      expect(useGameStore.getState().gamePhase).toBe('idle');
    });

    it('preserves dimension after resetGame', () => {
      useGameStore.getState().setDimension('Volcano');
      useGameStore.getState().resetGame();
      expect(useGameStore.getState().dimension).toBe('Volcano');
    });
  });
});
