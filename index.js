const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const { response } = require("express");
const websites = require("./data.js");
const app = express();

const articles = [];

const keywords =
  'a:contains("machine"), a:contains("AI"), a:contains("neural"), a:contains("deep"), a:contains("training"), a:contains("brain"), a:contains("models"), a:contains("NLP"), a:contains("machines"), a:contains("Model"), a:contains("Artificial"), a:contains("Deep"), a:contains("Machines"), a:contains("Algorithm")';

const regexp =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

websites.forEach((website) => {
  axios.get(website.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $(keywords, html).each(function () {
      const title = $(this).text();
      const url = $(this).attr("href");

      if (regexp.test(url)) {
        articles.push({
          title,
          url: website.mainURL + url,
          source: website.name,
        });
      }
    });
  });
});

app.get("/", (req, res) => {
  res.json("API");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:id", (req, res) => {
  const id = req.params.id;

  const websiteAddress = websites.filter((website) => website.name == id)[0]
    .address;
  const websiteMainUrl = websites.filter((website) => website.name == id)[0]
    .mainURL;

  axios
    .get(websiteAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const filteredArticles = [];

      $(keywords, html).each(function () {
        const title = $(this).text();
        const url = $(this).attr("href");

        filteredArticles.push({
          title,
          url: websiteMainUrl + url,
          source: id,
        });
      });
      res.json(filteredArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(process.env.PORT || 8000, () => {
  console.log("Backend server is running!");
});
