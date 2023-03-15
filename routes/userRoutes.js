const express = require("express");
const router = express.Router();
const axios = require("axios");
const Jimp = require("jimp");
const fs = require("fs");

router.get("/getdata", (req, res) => {
  const instaUrl = req.query.url;

  axios
    .get(instaUrl)
    .then((response) => {
      const html = response.data;

      const title = html.match(/<title>(.*?)<\/title>/)[1];

      const description = html.match(
        /<meta\s+property="og:description"\s+content="([^"]+)"\s*\/?>/i
      );
      if (!description === null) {
        description = description[1];
      }
      const ogImage = html.match(
        /<meta\s+property="og:image"\s+content="([^"]+)"\s*\/?>/i
      )[1];
      const siteUrl = html.match(/<meta property="og:url" content="(.*?)">/)[1];

      console.log("Title:", title);
      console.log("Description:", description);
      console.log("OG Image:", ogImage);
      console.log("Site URL:", siteUrl);
      const result = {
        title: title,
        description: description,
        ogImage: ogImage,
        siteUrl: siteUrl,
      };
      res.status(200).send({ status: "success", Metadata: result });
    })
    .catch((error) => {
      res
        .status(400)
        .send({ status: "Failed", message: "Pleas give valid url" });
    });
});

router.get("/img-combine", (req, res) => {
  let outputpath = "output.jpg";
  const { img1, img2 } = req.query;
  try {
    Jimp.read(img1, (err, image1) => {
      if (err) throw err;
      Jimp.read(img2, async (err, image2) => {
        if (err) throw err;

        image1.resize(500, 500);
        image2.resize(500, 500);

        const combined = new Jimp(
          image1.getWidth() + image2.getWidth(),
          image1.getHeight() + image2.getHeight()
        );

        combined.blit(image1, 0, 0);
        combined.blit(image2, image1.getWidth(), image1.getHeight());

        combined.greyscale();
        combined.write(outputpath);
        var newPath = __dirname + "/../" + "output.jpg";
        console.log(newPath);

        const cloudAPI = "dgysrrvk2";
        fs.readFile(newPath, async function (err, data) {
          if (err) {
            console.log(err.message);
          }

          const blob = new Blob([data], { type: Jimp.MIME_JPEG });
          console.log(blob);
          // console.log(data);
          const formData = new FormData();
          formData.append("file", blob);
          formData.append("upload_preset", "tnlhpsik");
          try {
            let imageUrl = null;

            const dat = await axios.post(
              `https://api.cloudinary.com/v1_1/${cloudAPI}/image/upload`,
              formData
            );
            console.log(dat);
            res
              .status(200)
              .send({ status: "success", imageURL: dat?.data?.secure_url });
          } catch (error) {
            res
              .status(400)
              .send({
                status: "Failed",
                message: "error in uploading please retry",
              });

            console.log(error.message);
          }
        });
      });
    });
  } catch (err) {
    res.status(400).send({ status: "Failed", message: "Pleas give valid url" });
  }
}),
  (module.exports = router);
