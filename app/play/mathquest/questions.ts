// ── QUESTION GENERATOR FOR ROO'S MATH QUEST ──────────────────────────────
// Zone 1: Multiplication (250+ questions)
// Zone 2: Division (220+ questions)
// Zone 3: Fractions + Decimals (150+ questions)

interface Question {
  q: string;
  a: string | number;
  choices: (string | number)[];
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function wrongNums(correct: number, count = 3): number[] {
  const wrongs = new Set<number>();
  const offsets = [-3,-2,-1,1,2,3,-5,5,-10,10,-4,4,-6,6,-7,7];
  for (const o of shuffle(offsets)) {
    const w = correct + o;
    if (w > 0 && w !== correct) wrongs.add(w);
    if (wrongs.size >= count) break;
  }
  while (wrongs.size < count) {
    const w = correct + (Math.floor(Math.random() * 20) - 10);
    if (w > 0 && w !== correct) wrongs.add(w);
  }
  return [...wrongs].slice(0, count);
}

// ZONE 1: MULTIPLICATION (250+ questions)
export function generateZone1(): Question[] {
  const questions: Question[] = [];

  // All facts 2x2 through 12x12
  for (let a = 2; a <= 12; a++) {
    for (let b = 2; b <= 12; b++) {
      const ans = a * b;
      questions.push({ q: `${a} x ${b} = ?`, a: ans, choices: shuffle([ans, ...wrongNums(ans)]) });
    }
  }

  // Missing factor problems
  const missingFacts = [
    [3,7],[4,6],[5,8],[6,9],[7,7],[8,6],[9,4],[3,9],[4,8],[5,7],
    [6,6],[7,8],[8,9],[9,6],[3,8],[4,7],[5,9],[6,7],[7,9],[8,8],
    [9,7],[3,6],[4,9],[5,6],[6,8],[10,4],[11,3],[12,5],[10,7],[11,6],
  ];
  missingFacts.forEach(([a,b]) => {
    const ans = a * b;
    questions.push({ q: `? x ${b} = ${ans}`, a, choices: shuffle([a,...wrongNums(a)]) });
    questions.push({ q: `${a} x ? = ${ans}`, a: b, choices: shuffle([b,...wrongNums(b)]) });
  });

  // Word problems (50+)
  const wp: Question[] = [
    { q: 'There are 6 boxes.\nEach has 8 apples.\nHow many apples total?', a: 48, choices: shuffle([48,...wrongNums(48)]) },
    { q: '9 bags of oranges.\nEach bag has 7.\nHow many oranges?', a: 63, choices: shuffle([63,...wrongNums(63)]) },
    { q: '5 trays of muffins.\nEach tray has 12.\nHow many muffins?', a: 60, choices: shuffle([60,...wrongNums(60)]) },
    { q: '4 boxes of donuts.\n8 donuts per box.\nHow many donuts?', a: 32, choices: shuffle([32,...wrongNums(32)]) },
    { q: '7 plates of cookies.\n6 cookies each plate.\nTotal cookies?', a: 42, choices: shuffle([42,...wrongNums(42)]) },
    { q: '11 baskets of berries.\n9 berries each.\nTotal berries?', a: 99, choices: shuffle([99,...wrongNums(99)]) },
    { q: '3 pizzas cut into\n8 slices each.\nTotal slices?', a: 24, choices: shuffle([24,...wrongNums(24)]) },
    { q: '12 cartons of eggs.\n12 eggs each.\nHow many eggs?', a: 144, choices: shuffle([144,...wrongNums(144)]) },
    { q: '6 jars of candy.\n11 candies per jar.\nTotal candies?', a: 66, choices: shuffle([66,...wrongNums(66)]) },
    { q: '8 packs of juice.\n6 bottles each.\nTotal bottles?', a: 48, choices: shuffle([48,...wrongNums(48)]) },
    { q: 'A class has 9 rows\nwith 7 students each.\nHow many students?', a: 63, choices: shuffle([63,...wrongNums(63)]) },
    { q: '5 shelves of books.\n12 books per shelf.\nTotal books?', a: 60, choices: shuffle([60,...wrongNums(60)]) },
    { q: '8 classrooms each\nhave 6 pencils.\nTotal pencils?', a: 48, choices: shuffle([48,...wrongNums(48)]) },
    { q: '4 art tables with\n9 crayons each.\nTotal crayons?', a: 36, choices: shuffle([36,...wrongNums(36)]) },
    { q: '7 students each\nhave 8 markers.\nTotal markers?', a: 56, choices: shuffle([56,...wrongNums(56)]) },
    { q: '11 folders each\nhave 9 papers.\nTotal papers?', a: 99, choices: shuffle([99,...wrongNums(99)]) },
    { q: '6 groups of students.\n7 students per group.\nTotal students?', a: 42, choices: shuffle([42,...wrongNums(42)]) },
    { q: '3 packs of stickers.\n12 stickers each.\nTotal stickers?', a: 36, choices: shuffle([36,...wrongNums(36)]) },
    { q: '9 desks per row.\n8 rows total.\nHow many desks?', a: 72, choices: shuffle([72,...wrongNums(72)]) },
    { q: '4 teachers each\nhave 11 students.\nTotal students?', a: 44, choices: shuffle([44,...wrongNums(44)]) },
    { q: '7 trees each\nhave 9 apples.\nTotal apples?', a: 63, choices: shuffle([63,...wrongNums(63)]) },
    { q: '8 birds each\nhave 3 eggs.\nTotal eggs?', a: 24, choices: shuffle([24,...wrongNums(24)]) },
    { q: '6 spiders each\nhave 8 legs.\nTotal legs?', a: 48, choices: shuffle([48,...wrongNums(48)]) },
    { q: '5 dogs each\nhave 4 paws.\nTotal paws?', a: 20, choices: shuffle([20,...wrongNums(20)]) },
    { q: '9 nests with\n6 eggs each.\nTotal eggs?', a: 54, choices: shuffle([54,...wrongNums(54)]) },
    { q: '7 fish tanks\nwith 8 fish each.\nTotal fish?', a: 56, choices: shuffle([56,...wrongNums(56)]) },
    { q: '4 ponds with\n11 frogs each.\nTotal frogs?', a: 44, choices: shuffle([44,...wrongNums(44)]) },
    { q: '3 beehives with\n12 bees each.\nTotal bees?', a: 36, choices: shuffle([36,...wrongNums(36)]) },
    { q: '10 flower pots\nwith 7 flowers each.\nTotal flowers?', a: 70, choices: shuffle([70,...wrongNums(70)]) },
    { q: '6 rabbit cages\nwith 9 rabbits each.\nTotal rabbits?', a: 54, choices: shuffle([54,...wrongNums(54)]) },
    { q: 'Roo jumps 4 feet\neach hop for 8 hops.\nHow far total?', a: 32, choices: shuffle([32,...wrongNums(32)]) },
    { q: '8 players each\nscore 7 points.\nTotal points?', a: 56, choices: shuffle([56,...wrongNums(56)]) },
    { q: '6 teams of\n9 players each.\nTotal players?', a: 54, choices: shuffle([54,...wrongNums(54)]) },
    { q: '5 rounds with\n8 points per round.\nTotal points?', a: 40, choices: shuffle([40,...wrongNums(40)]) },
    { q: '9 players each\nhave 6 cards.\nTotal cards?', a: 54, choices: shuffle([54,...wrongNums(54)]) },
    { q: '7 games played.\n12 points per game.\nTotal points?', a: 84, choices: shuffle([84,...wrongNums(84)]) },
    { q: '11 laps around\na track 8 times.\nTotal laps?', a: 88, choices: shuffle([88,...wrongNums(88)]) },
    { q: '4 soccer goals\nper game, 9 games.\nTotal goals?', a: 36, choices: shuffle([36,...wrongNums(36)]) },
    { q: '6 packs of gum.\n$7 each pack.\nTotal cost?', a: 42, choices: shuffle([42,...wrongNums(42)]) },
    { q: '9 toys at $8 each.\nTotal cost?', a: 72, choices: shuffle([72,...wrongNums(72)]) },
    { q: '12 pencils at\n$3 each.\nTotal cost?', a: 36, choices: shuffle([36,...wrongNums(36)]) },
    { q: '5 books at $9 each.\nTotal cost?', a: 45, choices: shuffle([45,...wrongNums(45)]) },
    { q: '7 shirts at\n$11 each.\nTotal cost?', a: 77, choices: shuffle([77,...wrongNums(77)]) },
    { q: '8 snacks at $6 each.\nTotal cost?', a: 48, choices: shuffle([48,...wrongNums(48)]) },
    { q: '4 weeks x 7 days.\nHow many days total?', a: 28, choices: shuffle([28,...wrongNums(28)]) },
    { q: '3 years x 12 months.\nHow many months?', a: 36, choices: shuffle([36,...wrongNums(36)]) },
    { q: '5 weeks x 7 days.\nHow many days total?', a: 35, choices: shuffle([35,...wrongNums(35)]) },
    { q: 'School is 9 months\nper year. 8 years\nof school = ? months?', a: 72, choices: shuffle([72,...wrongNums(72)]) },
    { q: '11 x 11 = ?', a: 121, choices: shuffle([121,...wrongNums(121)]) },
    { q: '12 x 12 = ?', a: 144, choices: shuffle([144,...wrongNums(144)]) },
    { q: '25 x 4 = ?',  a: 100, choices: shuffle([100,...wrongNums(100)]) },
    { q: '50 x 2 = ?',  a: 100, choices: shuffle([100,...wrongNums(100)]) },
    { q: '6 legs on each\ninsect. 9 insects.\nTotal legs?', a: 54, choices: shuffle([54,...wrongNums(54)]) },
    { q: 'A caterpillar has\n12 legs. 7 caterpillars.\nTotal legs?', a: 84, choices: shuffle([84,...wrongNums(84)]) },
    { q: '8 cans in a pack.\n9 packs bought.\nTotal cans?', a: 72, choices: shuffle([72,...wrongNums(72)]) },
    { q: '7 rows of seats.\n11 seats per row.\nTotal seats?', a: 77, choices: shuffle([77,...wrongNums(77)]) },
    { q: 'A farmer plants\n9 seeds per row.\n12 rows total.\nSeeds planted?', a: 108, choices: shuffle([108,...wrongNums(108)]) },
  ];
  wp.forEach(p => questions.push(p));
  return shuffle(questions);
}

// ZONE 2: DIVISION (220+ questions)
export function generateZone2(): Question[] {
  const questions: Question[] = [];

  // All division facts 2-12
  for (let a = 2; a <= 12; a++) {
    for (let b = 2; b <= 12; b++) {
      const dividend = a * b;
      questions.push({ q: `${dividend} / ${a} = ?`, a: b, choices: shuffle([b,...wrongNums(b)]) });
    }
  }

  // Division with remainders
  const remainderFacts: Question[] = [
    { q: '17 / 5 = ? r ?', a: '3 r 2', choices: ['3 r 2','2 r 7','4 r 2','3 r 3'] },
    { q: '23 / 4 = ? r ?', a: '5 r 3', choices: ['5 r 3','6 r 1','4 r 3','5 r 4'] },
    { q: '31 / 6 = ? r ?', a: '5 r 1', choices: ['5 r 1','4 r 7','6 r 1','5 r 2'] },
    { q: '43 / 7 = ? r ?', a: '6 r 1', choices: ['6 r 1','5 r 8','7 r 1','6 r 2'] },
    { q: '50 / 8 = ? r ?', a: '6 r 2', choices: ['6 r 2','7 r 1','5 r 10','6 r 3'] },
    { q: '29 / 3 = ? r ?', a: '9 r 2', choices: ['9 r 2','8 r 5','10 r 1','9 r 3'] },
    { q: '37 / 9 = ? r ?', a: '4 r 1', choices: ['4 r 1','3 r 10','5 r 1','4 r 2'] },
    { q: '53 / 6 = ? r ?', a: '8 r 5', choices: ['8 r 5','9 r 1','7 r 11','8 r 6'] },
    { q: '67 / 8 = ? r ?', a: '8 r 3', choices: ['8 r 3','7 r 11','9 r 3','8 r 4'] },
    { q: '73 / 9 = ? r ?', a: '8 r 1', choices: ['8 r 1','7 r 10','9 r 1','8 r 2'] },
    { q: '83 / 7 = ? r ?', a: '11 r 6',choices: ['11 r 6','12 r 1','10 r 13','11 r 7'] },
    { q: '97 / 11 = ? r ?',a: '8 r 9', choices: ['8 r 9','9 r 1','7 r 18','8 r 10'] },
  ];
  remainderFacts.forEach(f => questions.push(f));

  // Missing divisor problems
  const missingDiv = [
    [36,4,9],[45,5,9],[48,6,8],[56,7,8],[63,7,9],[72,8,9],
    [81,9,9],[84,7,12],[96,8,12],[110,11,10],[121,11,11],[144,12,12],
    [60,6,10],[77,7,11],[88,8,11],[99,9,11],[108,9,12],[132,11,12],
  ];
  missingDiv.forEach(([d,a,q]) => {
    questions.push({ q: `${d} / ? = ${q}`, a, choices: shuffle([a,...wrongNums(a)]) });
  });

  // Word problems (50+)
  const wp: Question[] = [
    { q: '42 cookies shared\namong 7 friends.\nHow many each?', a: 6, choices: shuffle([6,...wrongNums(6)]) },
    { q: '56 apples packed\ninto bags of 8.\nHow many bags?', a: 7, choices: shuffle([7,...wrongNums(7)]) },
    { q: '72 coins split\ninto 9 piles.\nCoins per pile?', a: 8, choices: shuffle([8,...wrongNums(8)]) },
    { q: '64 students split\ninto 8 equal groups.\nStudents per group?', a: 8, choices: shuffle([8,...wrongNums(8)]) },
    { q: '99 flowers packed\nin bunches of 9.\nHow many bunches?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '48 crayons shared\namong 6 students.\nCrayons each?', a: 8, choices: shuffle([8,...wrongNums(8)]) },
    { q: '36 stickers split\namong 4 friends.\nStickers each?', a: 9, choices: shuffle([9,...wrongNums(9)]) },
    { q: '55 books on\n5 equal shelves.\nBooks per shelf?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '84 marbles split\ninto 7 bags.\nMarbles per bag?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '120 pages read\nover 12 days.\nPages per day?', a: 10, choices: shuffle([10,...wrongNums(10)]) },
    { q: '84 eggs packed\nin boxes of 12.\nHow many boxes?', a: 7, choices: shuffle([7,...wrongNums(7)]) },
    { q: '60 donuts packed\nin boxes of 6.\nHow many boxes?', a: 10, choices: shuffle([10,...wrongNums(10)]) },
    { q: '88 muffins packed\n8 per tray.\nHow many trays?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '45 oranges in\nbags of 9.\nHow many bags?', a: 5, choices: shuffle([5,...wrongNums(5)]) },
    { q: '66 grapes split\nevenly on 6 plates.\nGrapes per plate?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '72 slices of pizza.\n8 slices per pizza.\nHow many pizzas?', a: 9, choices: shuffle([9,...wrongNums(9)]) },
    { q: '110 candies split\namong 11 kids.\nCandies each?', a: 10, choices: shuffle([10,...wrongNums(10)]) },
    { q: '36 juice boxes.\n6 per pack.\nHow many packs?', a: 6, choices: shuffle([6,...wrongNums(6)]) },
    { q: '48 crackers split\nevenly into 4 bags.\nCrackers per bag?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '77 seeds planted\nin 7 equal rows.\nSeeds per row?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '110 seats in\n11 equal rows.\nSeats per row?', a: 10, choices: shuffle([10,...wrongNums(10)]) },
    { q: '132 crayons split\namong 12 kids.\nCrayons each?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '144 tiles across\n12 equal rows.\nTiles per row?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '60 pencils split\namong 5 classes.\nPencils per class?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '54 books arranged\nin 9 equal piles.\nBooks per pile?', a: 6, choices: shuffle([6,...wrongNums(6)]) },
    { q: '96 papers split\namong 8 students.\nPapers each?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '63 markers split\namong 9 tables.\nMarkers per table?', a: 7, choices: shuffle([7,...wrongNums(7)]) },
    { q: '44 folders for\n4 equal groups.\nFolders per group?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '108 chairs placed\nin 9 equal rows.\nChairs per row?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '56 points scored\nacross 8 games.\nPoints per game?', a: 7, choices: shuffle([7,...wrongNums(7)]) },
    { q: '72 laps split\namong 9 runners.\nLaps per runner?', a: 8, choices: shuffle([8,...wrongNums(8)]) },
    { q: '48 cards dealt\nto 6 players.\nCards per player?', a: 8, choices: shuffle([8,...wrongNums(8)]) },
    { q: '33 goals scored\nover 11 games.\nGoals per game?', a: 3, choices: shuffle([3,...wrongNums(3)]) },
    { q: '80 points across\n10 rounds.\nPoints per round?', a: 8, choices: shuffle([8,...wrongNums(8)]) },
    { q: '48 legs total.\nEach spider has 8.\nHow many spiders?', a: 6, choices: shuffle([6,...wrongNums(6)]) },
    { q: '36 eggs in\nnests of 4.\nHow many nests?', a: 9, choices: shuffle([9,...wrongNums(9)]) },
    { q: '77 fish in\n7 equal tanks.\nFish per tank?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '60 flowers in\nbouquets of 12.\nHow many bouquets?', a: 5, choices: shuffle([5,...wrongNums(5)]) },
    { q: '40 paws total.\nEach cat has 4 paws.\nHow many cats?', a: 10, choices: shuffle([10,...wrongNums(10)]) },
    { q: 'You have $63.\nToys cost $9 each.\nHow many can you buy?', a: 7, choices: shuffle([7,...wrongNums(7)]) },
    { q: 'Spend $48 on\nbooks at $6 each.\nHow many books?', a: 8, choices: shuffle([8,...wrongNums(8)]) },
    { q: '$72 split equally\namong 8 friends.\nHow much each?', a: 9, choices: shuffle([9,...wrongNums(9)]) },
    { q: '$55 in gift cards\nat $11 each.\nHow many cards?', a: 5, choices: shuffle([5,...wrongNums(5)]) },
    { q: '$96 earned over\n8 weeks equally.\nEarned per week?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: 'Spent $84 on\n7 equal items.\nCost per item?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '60 minutes split\ninto 6 equal parts.\nMinutes per part?', a: 10, choices: shuffle([10,...wrongNums(10)]) },
    { q: '36 months is\nhow many years?', a: 3, choices: shuffle([3,...wrongNums(3)]) },
    { q: '84 days is\nhow many weeks?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '48 hours split\ninto 6 equal shifts.\nHours per shift?', a: 8, choices: shuffle([8,...wrongNums(8)]) },
    { q: '99 days split\ninto 9 equal parts.\nDays per part?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '108 students on\n9 equal buses.\nStudents per bus?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '132 pages in\n11 equal chapters.\nPages per chapter?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
    { q: '90 seconds split\ninto 9 turns.\nSeconds per turn?', a: 10, choices: shuffle([10,...wrongNums(10)]) },
    { q: '121 tiles in\n11 equal rows.\nTiles per row?', a: 11, choices: shuffle([11,...wrongNums(11)]) },
    { q: '144 students split\ninto 12 classes.\nStudents per class?', a: 12, choices: shuffle([12,...wrongNums(12)]) },
  ];
  wp.forEach(p => questions.push(p));
  return shuffle(questions);
}

// ZONE 3: FRACTIONS + DECIMALS (150+ questions)
export function generateZone3(): Question[] {
  const questions: Question[] = [];

  // Equivalent fractions
  const equivFracs: Question[] = [
    { q: '1/2 = ?/4',  a: '2/4',  choices: ['1/4','2/4','3/4','4/4'] },
    { q: '1/2 = ?/6',  a: '3/6',  choices: ['2/6','3/6','4/6','1/6'] },
    { q: '1/2 = ?/8',  a: '4/8',  choices: ['2/8','3/8','4/8','5/8'] },
    { q: '1/3 = ?/6',  a: '2/6',  choices: ['1/6','2/6','3/6','4/6'] },
    { q: '1/3 = ?/9',  a: '3/9',  choices: ['2/9','3/9','4/9','6/9'] },
    { q: '2/3 = ?/6',  a: '4/6',  choices: ['2/6','3/6','4/6','5/6'] },
    { q: '2/3 = ?/9',  a: '6/9',  choices: ['4/9','5/9','6/9','7/9'] },
    { q: '1/4 = ?/8',  a: '2/8',  choices: ['1/8','2/8','3/8','4/8'] },
    { q: '3/4 = ?/8',  a: '6/8',  choices: ['4/8','5/8','6/8','7/8'] },
    { q: '2/4 = ?',    a: '1/2',  choices: ['1/4','1/2','1/3','2/3'] },
    { q: '4/6 = ?',    a: '2/3',  choices: ['1/3','2/3','3/4','1/2'] },
    { q: '6/8 = ?',    a: '3/4',  choices: ['1/2','2/3','3/4','4/5'] },
    { q: '3/9 = ?',    a: '1/3',  choices: ['1/2','1/3','1/4','2/3'] },
    { q: '4/8 = ?',    a: '1/2',  choices: ['1/4','1/2','1/3','3/4'] },
    { q: '6/9 = ?',    a: '2/3',  choices: ['1/3','2/3','3/4','1/2'] },
  ];
  equivFracs.forEach(f => questions.push(f));

  // Adding fractions with like denominators
  const addLike = [
    ['1/4','2/4','3/4'],['1/5','2/5','3/5'],['1/5','3/5','4/5'],
    ['2/6','3/6','5/6'],['1/7','3/7','4/7'],['2/7','3/7','5/7'],
    ['1/8','3/8','4/8'],['1/8','5/8','6/8'],['3/8','4/8','7/8'],
    ['1/9','4/9','5/9'],['2/9','5/9','7/9'],['3/9','4/9','7/9'],
    ['1/10','3/10','4/10'],['3/10','4/10','7/10'],['2/10','5/10','7/10'],
    ['1/12','5/12','6/12'],['3/12','5/12','8/12'],['4/12','7/12','11/12'],
  ];
  addLike.forEach(([a,b,ans]) => {
    const denom = a.split('/')[1];
    const n = parseInt(ans.split('/')[0]);
    const wrongOpts = [`${n+1}/${denom}`,`${n-1}/${denom}`,`${n+2}/${denom}`].filter(w=>w!==ans).slice(0,3);
    questions.push({ q: `${a} + ${b} = ?`, a: ans, choices: shuffle([ans,...wrongOpts]) });
  });

  // Subtracting fractions with like denominators
  const subLike = [
    ['3/4','1/4','2/4'],['4/5','1/5','3/5'],['4/5','2/5','2/5'],
    ['5/6','2/6','3/6'],['6/7','2/7','4/7'],['5/7','3/7','2/7'],
    ['7/8','3/8','4/8'],['6/8','2/8','4/8'],['5/9','2/9','3/9'],
    ['8/9','3/9','5/9'],['7/10','3/10','4/10'],['9/10','4/10','5/10'],
    ['9/12','4/12','5/12'],['11/12','5/12','6/12'],['10/12','4/12','6/12'],
  ];
  subLike.forEach(([a,b,ans]) => {
    const denom = a.split('/')[1];
    const n = parseInt(ans.split('/')[0]);
    const wrongOpts = [`${n+1}/${denom}`,`${n+2}/${denom}`,`${n-1}/${denom}`].filter(w=>w!==ans&&parseInt(w)>0).slice(0,3);
    questions.push({ q: `${a} - ${b} = ?`, a: ans, choices: shuffle([ans,...wrongOpts]) });
  });

  // Comparing fractions
  const compareFracs: Question[] = [
    { q: 'Which is larger?\n1/2 or 1/3?',  a: '1/2',  choices: ['1/2','1/3','equal','neither'] },
    { q: 'Which is larger?\n3/4 or 2/3?',  a: '3/4',  choices: ['2/3','3/4','equal','neither'] },
    { q: 'Which is larger?\n2/5 or 1/3?',  a: '2/5',  choices: ['1/3','2/5','equal','neither'] },
    { q: 'Which is larger?\n5/6 or 3/4?',  a: '5/6',  choices: ['3/4','5/6','equal','neither'] },
    { q: 'Which is smaller?\n1/4 or 1/5?', a: '1/5',  choices: ['1/4','1/5','equal','neither'] },
    { q: 'Which is smaller?\n2/3 or 3/4?', a: '2/3',  choices: ['2/3','3/4','equal','neither'] },
    { q: '2/4 compared\nto 1/2 is...?',   a: 'equal', choices: ['greater','less','equal','double'] },
    { q: '3/6 compared\nto 1/2 is...?',   a: 'equal', choices: ['greater','less','equal','half'] },
    { q: 'Which is larger?\n7/8 or 5/6?',  a: '7/8',  choices: ['5/6','7/8','equal','neither'] },
    { q: 'Which is larger?\n3/5 or 4/7?',  a: '3/5',  choices: ['4/7','3/5','equal','neither'] },
  ];
  compareFracs.forEach(f => questions.push(f));

  // Fractions of whole numbers
  const fracOfWhole: Question[] = [
    { q: '1/2 of 20 = ?', a: '10', choices: ['5','8','10','12'] },
    { q: '1/2 of 36 = ?', a: '18', choices: ['12','15','18','24'] },
    { q: '1/4 of 20 = ?', a: '5',  choices: ['4','5','6','8'] },
    { q: '1/4 of 40 = ?', a: '10', choices: ['8','10','12','15'] },
    { q: '3/4 of 20 = ?', a: '15', choices: ['10','12','15','18'] },
    { q: '3/4 of 40 = ?', a: '30', choices: ['20','25','30','35'] },
    { q: '1/3 of 30 = ?', a: '10', choices: ['8','9','10','12'] },
    { q: '1/3 of 24 = ?', a: '8',  choices: ['6','7','8','9'] },
    { q: '2/3 of 30 = ?', a: '20', choices: ['15','18','20','24'] },
    { q: '2/3 of 24 = ?', a: '16', choices: ['12','14','16','18'] },
    { q: '1/5 of 25 = ?', a: '5',  choices: ['4','5','6','7'] },
    { q: '2/5 of 25 = ?', a: '10', choices: ['8','9','10','12'] },
    { q: '3/5 of 25 = ?', a: '15', choices: ['10','12','15','18'] },
    { q: '1/6 of 36 = ?', a: '6',  choices: ['4','5','6','7'] },
    { q: '5/6 of 36 = ?', a: '30', choices: ['24','27','30','33'] },
  ];
  fracOfWhole.forEach(f => questions.push(f));

  // Decimals
  const decimals: Question[] = [
    { q: '0.5 + 0.3 = ?',  a: '0.8',  choices: ['0.35','0.53','0.8','0.83'] },
    { q: '0.7 + 0.6 = ?',  a: '1.3',  choices: ['1.13','1.3','0.13','1.33'] },
    { q: '1.2 + 0.9 = ?',  a: '2.1',  choices: ['1.11','2.1','1.29','2.01'] },
    { q: '0.9 - 0.4 = ?',  a: '0.5',  choices: ['0.5','0.14','0.54','0.45'] },
    { q: '1.5 - 0.8 = ?',  a: '0.7',  choices: ['0.7','0.3','1.3','0.77'] },
    { q: '2.3 - 1.7 = ?',  a: '0.6',  choices: ['0.6','1.6','0.4','0.16'] },
    { q: '0.25 as a\nfraction?', a: '1/4', choices: ['1/2','1/4','1/5','2/5'] },
    { q: '0.5 as a\nfraction?', a: '1/2', choices: ['1/4','1/2','1/5','1/3'] },
    { q: '0.75 as a\nfraction?', a: '3/4', choices: ['1/4','2/3','3/4','3/5'] },
    { q: '1/4 as a\ndecimal?',  a: '0.25',choices: ['0.14','0.25','0.4','0.5'] },
    { q: '1/2 as a\ndecimal?',  a: '0.5', choices: ['0.2','0.5','0.12','0.15'] },
    { q: '3/4 as a\ndecimal?',  a: '0.75',choices: ['0.34','0.7','0.73','0.75'] },
    { q: 'Which is larger?\n0.6 or 0.59?', a: '0.6', choices: ['0.6','0.59','equal','neither'] },
    { q: 'Which is larger?\n0.4 or 0.40?', a: 'equal', choices: ['0.4','0.40','equal','neither'] },
    { q: '3.5 + 2.7 = ?',  a: '6.2',  choices: ['5.12','6.2','5.2','6.12'] },
    { q: '4.8 - 2.3 = ?',  a: '2.5',  choices: ['2.1','2.5','2.15','3.5'] },
    { q: '1.0 - 0.3 = ?',  a: '0.7',  choices: ['0.3','0.7','1.3','0.97'] },
    { q: '0.1 + 0.9 = ?',  a: '1.0',  choices: ['0.10','1.0','0.19','1.9'] },
    { q: 'Round 3.7 to\nnearest whole?', a: '4', choices: ['3','4','3.5','7'] },
    { q: 'Round 5.2 to\nnearest whole?', a: '5', choices: ['5','6','5.2','2'] },
  ];
  decimals.forEach(f => questions.push(f));

  // Word problems (50+)
  const wp: Question[] = [
    { q: 'A pizza has 8 slices.\nYou eat 3 slices.\nWhat fraction eaten?', a: '3/8', choices: ['1/4','3/8','1/2','5/8'] },
    { q: 'You read 1/4 of\na 40-page book.\nHow many pages?', a: '10', choices: ['8','10','12','15'] },
    { q: '1/2 of the class\nof 28 are girls.\nHow many girls?', a: '14', choices: ['12','14','16','18'] },
    { q: 'A ribbon is 3/4 m.\nAnother is 1/4 m.\nTotal length?', a: '1 m', choices: ['1/2 m','3/4 m','1 m','1 1/4 m'] },
    { q: 'You drank 2/5\nof a 20oz drink.\nHow many oz?', a: '8', choices: ['4','6','8','10'] },
    { q: 'Roo ate 3/8 of\na pie. What fraction\nis left?', a: '5/8', choices: ['1/4','3/8','5/8','3/4'] },
    { q: 'A path is 1/2 mile.\nYou walked 1/4 mile.\nHow much is left?', a: '1/4', choices: ['1/4','1/2','3/4','1/8'] },
    { q: '3/5 of 30 kids\nplay soccer.\nHow many kids?', a: '18', choices: ['12','15','18','20'] },
    { q: '2/3 of 12 eggs\nare brown.\nHow many brown?', a: '8', choices: ['4','6','8','10'] },
    { q: 'A bar of chocolate\nhas 12 pieces.\n1/3 is eaten.\nHow many eaten?', a: '4', choices: ['3','4','5','6'] },
    { q: 'A bag has 20 grapes.\n1/4 are red.\nHow many red?', a: '5', choices: ['4','5','6','8'] },
    { q: 'There are 16 crayons.\n3/4 are blue.\nHow many blue?', a: '12', choices: ['8','10','12','14'] },
    { q: '24 students.\n1/6 wear glasses.\nHow many wear glasses?', a: '4', choices: ['3','4','5','6'] },
    { q: '30 coins in a jar.\n2/5 are pennies.\nHow many pennies?', a: '12', choices: ['10','12','14','15'] },
    { q: 'A class of 36 kids.\n1/4 walk to school.\nHow many walk?', a: '9', choices: ['7','8','9','10'] },
    { q: 'A shelf has 18 books.\n2/3 are chapter books.\nHow many?', a: '12', choices: ['9','10','12','14'] },
    { q: '40 balloons at a party.\n3/8 are red.\nHow many red?', a: '15', choices: ['10','12','15','18'] },
    { q: '50 students.\n3/5 prefer math.\nHow many?', a: '30', choices: ['20','25','30','35'] },
    { q: 'You have $5.50\nand spend $2.25.\nHow much left?', a: '$3.25', choices: ['$2.25','$3.00','$3.25','$3.50'] },
    { q: 'A book costs $4.75.\nYou pay $5.00.\nChange received?', a: '$0.25', choices: ['$0.15','$0.20','$0.25','$0.50'] },
    { q: 'You run 1.5 miles\nin the morning and\n0.8 miles at night.\nTotal miles?', a: '2.3', choices: ['1.8','2.0','2.3','2.5'] },
    { q: 'A plant grows 2.4 cm\nin May and 1.6 cm\nin June. Total growth?', a: '4.0 cm', choices: ['3.0 cm','3.8 cm','4.0 cm','4.2 cm'] },
    { q: 'A rope is 3.7 m.\nAnother is 2.4 m.\nTotal length?', a: '6.1 m', choices: ['5.1 m','5.7 m','6.1 m','6.3 m'] },
    { q: 'You had $10.00\nand spent $6.75.\nHow much left?', a: '$3.25', choices: ['$3.00','$3.25','$3.50','$4.25'] },
    { q: 'A bottle holds\n1.5 liters. You drink\n0.7 liters. How much left?', a: '0.8 L', choices: ['0.5 L','0.7 L','0.8 L','0.9 L'] },
    { q: 'Is 0.5 equal\nto 1/2?', a: 'Yes', choices: ['Yes','No','Not sure','Never'] },
    { q: 'Is 0.25 equal\nto 1/4?', a: 'Yes', choices: ['Yes','No','Not sure','Never'] },
    { q: 'Is 0.75 equal\nto 3/4?', a: 'Yes', choices: ['Yes','No','Not sure','Never'] },
    { q: 'Which is greater:\n1/2 or 0.4?', a: '1/2', choices: ['1/2','0.4','equal','neither'] },
    { q: 'Which is greater:\n3/4 or 0.8?', a: '0.8', choices: ['3/4','0.8','equal','neither'] },
    { q: 'Which is greater:\n2/5 or 0.5?', a: '0.5', choices: ['2/5','0.5','equal','neither'] },
    { q: '0.6 is the same\nas which fraction?', a: '3/5', choices: ['1/2','3/5','2/3','3/4'] },
    { q: '0.8 is the same\nas which fraction?', a: '4/5', choices: ['3/4','4/5','7/8','5/6'] },
    { q: '0.2 is the same\nas which fraction?', a: '1/5', choices: ['1/4','1/5','1/3','2/3'] },
    { q: 'Order smallest to\nlargest: 1/4, 1/2, 1/3', a: '1/4, 1/3, 1/2', choices: ['1/4, 1/3, 1/2','1/2, 1/3, 1/4','1/3, 1/4, 1/2','1/4, 1/2, 1/3'] },
    { q: 'Order smallest to\nlargest: 0.3, 0.13, 0.31', a: '0.13, 0.3, 0.31', choices: ['0.13, 0.3, 0.31','0.3, 0.13, 0.31','0.31, 0.3, 0.13','0.13, 0.31, 0.3'] },
    { q: 'Which is between\n1/4 and 3/4?', a: '1/2', choices: ['1/8','1/2','7/8','1/3'] },
    { q: 'Which is between\n0.2 and 0.8?', a: '0.5', choices: ['0.1','0.5','0.9','1.0'] },
    { q: 'What is halfway\nbetween 0 and 1?', a: '0.5', choices: ['0.1','0.25','0.5','0.75'] },
    { q: '48 students.\n1/4 play violin.\nHow many play violin?', a: '12', choices: ['8','10','12','16'] },
    { q: 'A garden has\n48 plants. 5/6\nare flowers. How many?', a: '40', choices: ['36','38','40','42'] },
    { q: 'A jug holds 1 liter.\n3/4 is full.\nHow much inside?', a: '3/4 L', choices: ['1/4 L','1/2 L','3/4 L','1 L'] },
    { q: 'You spent 3/4 of\nyour $20 allowance.\nHow much spent?', a: '$15', choices: ['$5','$10','$15','$18'] },
    { q: '1/3 of the 24\nstudents are absent.\nHow many absent?', a: '8', choices: ['6','7','8','9'] },
    { q: 'A tank is 2/3 full.\nIt holds 30 gallons.\nHow many gallons inside?', a: '20', choices: ['10','15','20','25'] },
    { q: 'You ate 3/4 of\n16 strawberries.\nHow many eaten?', a: '12', choices: ['8','10','12','14'] },
    { q: '5/8 of 40 kids\nlike soccer.\nHow many kids?', a: '25', choices: ['20','22','25','30'] },
    { q: 'A recipe needs\n3/4 cup of sugar.\nDouble the recipe.\nHow much sugar?', a: '1 1/2 cups', choices: ['1 cup','1 1/4 cups','1 1/2 cups','2 cups'] },
    { q: 'You finished 2/5\nof your homework.\nWhat fraction is left?', a: '3/5', choices: ['1/5','2/5','3/5','4/5'] },
    { q: 'A wall is 6.5 m.\nYou paint 2.3 m.\nHow much is unpainted?', a: '4.2 m', choices: ['3.2 m','4.0 m','4.2 m','4.5 m'] },
    { q: 'Round 7.8 to\nthe nearest whole.', a: '8', choices: ['7','8','7.5','9'] },
    { q: 'Round 4.3 to\nthe nearest whole.', a: '4', choices: ['4','5','4.3','3'] },
  ];
  wp.forEach(p => questions.push(p));
  return shuffle(questions);
}
