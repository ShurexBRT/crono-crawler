export interface MemoryArtifact {
  id: string;
  title: string;
  kind: 'drawing' | 'photograph' | 'letter' | 'keepsake' | 'notebook';
  image: string;
  alt: string;
  caption: string;
  byline: string;
  inscription?: string;
  letter?: { greeting: string; paragraphs: string[]; signature: string };
}

export const memoryArtifacts: MemoryArtifact[] = [
  {
    id: 'reactor-daughter-sketch', title: 'Three Suns', kind: 'drawing',
    image: 'assets/memories/three-suns.png',
    alt: 'Mara\'s crayon city with three suns, a tram, and her father holding her hand.',
    caption: 'One for school. One for home. One in case we get lost.', byline: 'Mara\'s drawing / Folded Reactor',
    inscription: 'Dad says there is only one. I think we should have a spare.',
  },
  {
    id: 'rain-payphone', title: 'The Window Seat', kind: 'photograph',
    image: 'assets/memories/window-seat.png',
    alt: 'Mara in a tram window seat, keeping the empty seat beside her for Elias.',
    caption: 'You were late. I saved it anyway.', byline: 'A photograph tucked inside the payphone',
    inscription: 'Dad, the tram is early. I saved you the window seat.',
  },
  {
    id: 'rain-lamp-letter', title: 'The Long Way Home', kind: 'letter',
    image: 'assets/memories/mara-letter.png',
    alt: 'Folded ivory stationery with a small three-sun doodle and an open envelope.',
    caption: 'A letter from Mara, folded small enough to fit in his coat.', byline: 'Mara Varren / Before the Still Hour',
    letter: {
      greeting: 'Dear Dad,',
      paragraphs: [
        'You missed the tram again. I am not cross. Well, a little.',
        'Tomorrow can we take the long way home? Past the canal, then the booth that gives us an extra picture. You can wear the crown this time.',
        'You do not have to fix anything. Just come with me.',
      ],
      signature: 'Love, Mara',
    },
  },
  {
    id: 'canal-bell-token', title: 'A Spare Fare', kind: 'keepsake',
    image: 'assets/memories/spare-token.png',
    alt: 'A worn brass tram token on a short teal cord, beside a torn pink ticket.',
    caption: 'For anyone who forgot theirs.', byline: 'Mara\'s spare token / Bellweather Canals',
    inscription: 'We can argue about the fare after we get there.',
  },
  {
    id: 'market-photo-strip', title: 'An Extra Second', kind: 'photograph',
    image: 'assets/memories/photo-strip.png',
    alt: 'Four booth photographs of Elias and Mara blinking, laughing, wearing a paper crown, and trying to look serious.',
    caption: 'We said we would look serious in the last one.', byline: 'Minute Market / The broken-shutter booth',
    inscription: 'We did not.',
  },
  {
    id: 'hotel-room-key', title: 'Room 00', kind: 'keepsake',
    image: 'assets/memories/room-key.png',
    alt: 'A brass hotel key and worn jade enamel fob resting on folded stationery.',
    caption: 'One arrival. A hundred postponed departures.', byline: 'Hourglass Hotel / Elias\'s room',
    inscription: 'Keeping the room was easier than leaving it.',
  },
  {
    id: 'archive-unsent-letter', title: 'The Letter He Kept', kind: 'letter',
    image: 'assets/memories/unsent-letter.png',
    alt: 'An unfolded letter on pale paper, beside a capped fountain pen and a sealed envelope.',
    caption: 'An unfinished answer. Never posted.', byline: 'Elias Varren / Archive of Unsaid Things',
    letter: {
      greeting: 'My Mara,',
      paragraphs: [
        'I keep remembering the last day. It has crowded out so many better ones.',
        'Today I tried to remember your terrible singing instead. The way you changed every song halfway through because you had thought of a better ending.',
        'For a moment, I was glad I could. I wanted to tell you that.',
      ],
      signature: 'Dad',
    },
  },
  {
    id: 'crownline-paper-crown', title: 'A Small Kingdom', kind: 'keepsake',
    image: 'assets/memories/paper-crown.png',
    alt: 'A slightly crooked paper crown folded from used pink and jade tram tickets.',
    caption: 'The long way, please.', byline: 'Mara\'s ticket-paper crown / Crownline Rooftops',
    inscription: 'He can keep the paper without keeping the world inside it.',
  },
  {
    id: 'reliquary-first-second', title: 'Tomorrow', kind: 'notebook',
    image: 'assets/memories/first-second.png',
    alt: 'An open calibration notebook with a small diagram on one page and the next page empty.',
    caption: 'Tomorrow will hurt less.', byline: 'The first calibration log / Elias Varren',
    inscription: 'The next page is finally empty.',
  },
];

export function getMemoryArtifact(id: string): MemoryArtifact | undefined {
  return memoryArtifacts.find((artifact) => artifact.id === id);
}
