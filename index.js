const { readFileSync, writeFileSync, readdirSync, rmSync, existsSync, mkdirSync } = require('fs');
const sharp = require('sharp');

const template = `
  <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- bg -->
    <!-- head -->
    <!-- hair -->
    <!-- eyes -->
    <!-- nose -->
    <!-- mouth -->
    <!-- beard -->
  </svg>
`

const bg_MAP = [
  'Cherry Red',
  'Lime Green',
  'Banana Yellow',
  'Grape Purple',
  'Slushie Blue',
  'Creamsicle Orange'
];

const hair_MAP = [
  'Shagadelic',
  'Baldylocks',
  'Hightop',
  'Silkysmooth',
  'Sidewave',
  'Patchy',
  'Mousse',
  'Oceanic'
];

const eyes_MAP = [
  'Beady',
  'Woody',
  'Uneven',
  'Uni',
  'Block',
  'Stary',
  'Looky',
  'Wideopen',
  'Squint',
  'Wink'
];

const nose_MAP = [
  'Straight',
  'Skidoodle',
  'Oink',
  'Nostril',
  'Angle'
];

const mouth_MAP = [
  'Pursed',
  'Oh',
  'Smiley',
  'Golly',
  'Jagged',
  'Frowny'
];

const beard_MAP = [
  'Stache',
  'Sidewall',
  'Goat',
  'Scruff'
];

const takenNames = {};
const takenFaces = {};
let idx = 999;

const records = [];

function randInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}


function getRandomName() {
  const adjectives = 'fired trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical'.split(' ');
  const names = 'aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis'.split(' ');
  
  const randAdj = titleCase(randElement(adjectives));
  const randName = titleCase(randElement(names));
  const name =  `${randAdj} ${randName}`;


  if (takenNames[name] || !name) {
    return getRandomName();
  } else {
    takenNames[name] = name;
    return name;
  }
}

function titleCase(str) {
  return str.toLowerCase().split(' ').map(function(word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}

function getLayer(name, skip=0.0) {
  const svg = readFileSync(`./layers/${name}.svg`, 'utf-8');
  const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : '';
}

async function svgToPng(name) {
  const src = `./out/${name}.svg`;
  const dest = `./out/${name}.png`;

  const img = await sharp(src);
  const resized = await img.resize(1024);
  await resized.toFile(dest);
}


function createImage(idx) {

  const bg = randInt(5);
  const hair = randInt(7);
  const eyes = randInt(9);
  const nose = randInt(4); 
  const mouth = randInt(5);
  const beard = randInt(3);
  // 18,900 combinations

  const face = [hair, eyes, mouth, nose, beard].join('');

  if (face[takenFaces]) {
    createImage();
  } else {
    const name = getRandomName()
    console.log(name)
    face[takenFaces] = face;

    const final = template
      .replace('<!-- bg -->', getLayer(`bg${bg}`))
      .replace('<!-- head -->', getLayer('head0'))
      .replace('<!-- hair -->', getLayer(`hair${hair}`))
      .replace('<!-- eyes -->', getLayer(`eyes${eyes}`))
      .replace('<!-- nose -->', getLayer(`nose${nose}`))
      .replace('<!-- mouth -->', getLayer(`mouth${mouth}`))
      .replace('<!-- beard -->', getLayer(`beard${beard}`, 0.5))

    const meta = {
      id: idx,
      name,
      description: `A drawing of ${name}`,
      image: `${idx}.png`,
      attributes: [
        { 
          trait_type: 'Background',
          value: bg_MAP[bg]
        },
        { 
          trait_type: 'Hair',
          value: hair_MAP[hair]
        },
        { 
          trait_type: 'Eyes',
          value: eyes_MAP[eyes]
        },
        { 
          trait_type: 'Nose',
          value: nose_MAP[nose]
        },
        { 
          trait_type: 'Mouth',
          value: mouth_MAP[mouth]
        },
        { 
          trait_type: 'Beard',
          value: beard_MAP[beard]
        }
      ]
    }
    records.push(meta);
    writeFileSync(`./out/${idx}.json`, JSON.stringify(meta))
    writeFileSync(`./out/${idx}.svg`, final)
    svgToPng(idx)
  }
}


// Create dir if not exists
if (!existsSync('./out')){
  mkdirSync('./out');
}

// Cleanup dir before each run
readdirSync('./out').forEach(f => rmSync(`./out/${f}`));


do {
  createImage(idx);
  idx--;
} while (idx >= 0);

writeFileSync(`./out/db.json`, JSON.stringify(records));
