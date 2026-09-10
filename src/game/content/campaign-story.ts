import type { LevelData } from '../types';

const openings: Record<string, string[]> = {
  tutorial: [
    'The clock above Elias has stopped. The gauntlet on his wrist has not. Beneath the observatory, something is still asking for another second.',
    'A paper crown lies beside the emergency lift. He knows who folded it. He cannot yet remember why he came back.',
  ],
  'level-1': [
    'Lock Street is caught between a tram bell and its echo. A payphone rings in a year that no longer exists.',
    'On the roof, a man in a dark coat presses two fingers to his wrist. Elias catches himself making the same gesture.',
  ],
  'rain-crossing': [
    'The crossing leads to Glasshouse, where Mara used to wait after school. Rain hangs over the railings, each drop holding a smaller city.',
    'The Keeper has sealed the route. The old machinery still remembers a way through.',
  ],
  'level-2': [
    'Mara stands beside the conservatory doors, holding the crown she made from a tram ticket.',
    '"You promised we could take the long way home." She smiles, then says it again with exactly the same breath.',
  ],
  'level-3': [
    'The departure board is empty. Behind the glass, every passenger has been waiting through the same farewell.',
    'Elias finds his maintenance signature on the lock. Below it is the same signature, older and less steady.',
  ],
  'bellweather-canals': [
    'The transit line ends above Bellweather. Mara once dropped a token here and insisted the canal had earned a ride.',
    'Now water is held against the floodgates by a correction order bearing Elias Varren\'s name.',
  ],
  'minute-market': [
    'Mara always chose the photo booth with the broken shutter. She said the extra second made everyone look honest.',
    'The booth is still here. So is the afternoon. The route to the hotel runs behind the shuttered stalls.',
  ],
  'hourglass-hotel': [
    'The guest book has one name written a hundred times: Elias Varren. Every departure left blank.',
    'He rented a room after the funeral. He remembers that now. The Keeper has been renewing it ever since.',
  ],
  'unsaid-archive': [
    'The archive kept the records Elias ordered destroyed: a loss, an experiment, a correction.',
    'Three accounts of the same hour. He will have to open them in order, even if he already knows the last line.',
  ],
  'crownline-rooftops': [
    'Above the archive, Elias finally sees the boundary of the Still Hour. Beyond it, there is weather he has never touched.',
    'The observatory is ahead. This time he is not going there to bring someone back.',
  ],
  'core-reliquary': [
    'Three chambers fed the correction loop: what he remembered, what he refused, and what he would not let begin.',
    'The Keeper\'s records are in Elias\'s handwriting. Not copied. Continued.',
  ],
  boss: [
    'The Keeper waits beside the Core, one hand resting on the same worn gauntlet.',
    '"I gave us all the time in the world," he says. Elias looks at the three anchors. "No. You gave us the same second."',
  ],
};

const zoneLines: Record<string, string[]> = {
  'keeper-trace': ['The man on the roof favors his left leg. Elias feels the old laboratory injury ache in his own.'],
  'girl-vanish': ['"The long way home," Mara says once more. Then the signal loses her outline.', 'No footsteps leave the glasshouse. Only a recorded second, repeating until someone lets it end.'],
  'canal-keeper-mark': ['The floodgate order has been amended hundreds of times. The first signature is Elias\'s. The last is the Keeper\'s. The pen never changed hands.'],
  'hotel-guest-book': ['In the room, the paper crown rests on an untouched pillow. Elias had mistaken keeping everything still for keeping someone safe.'],
  'archive-truth': ['Mara died before the Core was activated. The recovery reports are blank.', 'The machine preserved a memory, then trapped Veyr around the man who refused to call it one.'],
};

const memoryLines: Record<string, string[]> = {
  'reactor-daughter-sketch': ['Mara drew the city with three suns. "One for school, one for home, and one in case we get lost." Elias had laughed. She had been quite serious.'],
  'rain-payphone': ['"Dad, the tram is early. I saved you the window seat." In the background, Mara argues cheerfully with the ticket machine. Elias remembers the ordinary impatience of being loved.'],
  'rain-lamp-letter': ['Mara had slipped the letter into his coat before school. He had carried it through a hundred corrections. She had never asked him for more time. Only to spend some with her.'],
  'canal-bell-token': ['A brass transit token, worn smooth by Mara\'s thumb. She kept a spare for anyone who had forgotten theirs. "We can argue about the fare after we get there."'],
  'market-photo-strip': ['Four frames: Elias blinking, Mara laughing, a crooked paper crown, then both trying very hard to look serious. The machine did not need to improve a single one.'],
  'hotel-room-key': ['Room 00. Elias kept the room exactly as she left it. Even the dust was not allowed to settle. The key is warm from a hundred versions of his hand.'],
  'archive-unsent-letter': ['An unfinished letter in Elias\'s hand: I keep remembering the last day. Today I tried to remember your terrible singing instead. For a moment, I was glad I could.'],
  'crownline-paper-crown': ['The crown is folded from a used tram ticket. On the back Mara wrote: the long way, please. He can keep the paper without keeping the world inside it.'],
  'reliquary-first-second': ['The first calibration log contains no equations. Only Elias promising that tomorrow will hurt less. The next page is finally empty.'],
};

export function withCampaignStory(level: LevelData): LevelData {
  return {
    ...level,
    startLines: openings[level.id] ?? level.startLines,
    storyZones: level.storyZones.map((zone) => ({ ...zone, lines: zoneLines[zone.id] ?? zone.lines })),
    memoryFragments: level.memoryFragments?.map((memory) => ({ ...memory, lines: memoryLines[memory.id] ?? memory.lines })),
  };
}
