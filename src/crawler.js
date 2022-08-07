const puppeteer = require('puppeteer');

const regexGlobalInfo = /<font class="normal"><b>(.*) \[(.*) pts\]<\/b><br>\((.*)\)<br>Dernier état connu : .* width="25"> ([a-zA-ZÀ-ÿ !]*)<br>*(Date et source : (.*[ ]\d{4}) (\(.*\))?.*)?/;
const regexComments = /(.*) \(([0-9]{2}\/[0-9]{2}\/[0-9]{4})\) :(.*)/;

const getImages = async (page, index, name, imgIndex, json) => {
  let srcImage = await page.evaluate(
    (index, imgIndex) => {
      // eslint-disable-next-line no-undef
      let obj = document.querySelector(
        `tr.haut:nth-child(${index * 3 + 1}) > td:nth-child(${imgIndex}) img`
      );
      if (!obj) {
        return null;
      }
      return obj.getAttribute('src');
    },
    index,
    imgIndex
  );
  if (imgIndex === 2) {
    srcImage = await page.evaluate(
      (index, imgIndex) => {
        // eslint-disable-next-line no-undef
        let obj = document.querySelector(
          `tr.haut:nth-child(${index * 3 + 1}) > td:nth-child(${imgIndex}) a`
        );
        if (!obj) {
          return null;
        }
        return obj.getAttribute('href');
      },
      index,
      imgIndex
    );
  }

  if (srcImage) {
    if (!srcImage.startsWith('http')) {
      srcImage = `http://invader.spotter.free.fr/${srcImage}`;
    }

    json.image = {
      ...json.image,
      [name]: srcImage,
    };

    // try {
    //   const b64 = await imageToBase64(srcImage);
    // } catch (error) {}
  }
};

const getInfoMetadata = async (page, index, json) => {
  const globalInfo = await page.evaluate((index) => {
    // eslint-disable-next-line no-undef
    return document.querySelector(
      `tr.haut:nth-child(${index * 3 + 1}) > td > font`
    ).outerHTML;
  }, index);
  const resGlobalInfo = globalInfo.match(regexGlobalInfo);

  if (resGlobalInfo) {
    const name = resGlobalInfo[1];
    const points = resGlobalInfo[2];
    const city = resGlobalInfo[3];
    const status = resGlobalInfo[4].trim();

    const date = resGlobalInfo[6];

    json.metadata = { name, points, city, status, date };
  } else {
    console.error(`no regex found for: ${globalInfo}`);
  }
};

const getComments = async (page, index, json) => {
  const comments = await page.evaluate((index) => {
    // eslint-disable-next-line no-undef
    const arr = document.querySelectorAll(`#ajoutform${index} div`);
    return Array.from(arr, (element) => element.textContent);
  }, index);

  if (!comments) {
    return;
  }
  json.comments = [];
  for (let i = 0; i < comments.length; i += 1) {
    const resComments = comments[i].match(regexComments);

    if (resComments) {
      const author = resComments[1];
      const date = resComments[2];
      const comment = resComments[3];
      json.comments.push({
        author,
        date,
        comment,
      });
    }
  }
};

const parsePage = async (page) => {
  const trLength = await page.$$eval('tr.haut', (tr) => tr.length);

  const jsons = [];

  for (let index = 0; index < trLength; index += 1) {
    let json = {};

    // get data
    await getInfoMetadata(page, index, json);

    if (!json.metadata) {
      console.log('no metadata');
      continue;
    }

    // get comment
    await getComments(page, index, json);

    // get main image
    await getImages(page, index, 'main', 1, json);
    await getImages(page, index, 'street', 2, json);
    await getImages(page, index, 'streetUpdated', 3, json);

    jsons.push(json);
  }
  return jsons;
};

const buttonNextPage = (index) =>
  `#contenu > p:nth-child(4) > a:nth-child(${index})`;

const fetchDataFromWebSite = async (pushData) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('http://invader.spotter.free.fr/listing.php');

  const length = await page.evaluate(
    // eslint-disable-next-line no-undef
    () => document.querySelectorAll('#contenu > p:nth-child(4) > a').length
  );
  console.log('Number of page:', length);

  for (let i = 0; i < length; i += 1) {
    const jsons = await parsePage(page);
    await pushData(jsons);

    const val = buttonNextPage(i + 1);

    // click on next and wait
    // eslint-disable-next-line no-undef
    await page.evaluate((val) => document.querySelector(val).click(), val);
    await page.waitForNavigation({
      waitUntil: 'networkidle2',
    });
  }

  await browser.close();
};

module.exports = {
  fetchDataFromWebSite,
};
