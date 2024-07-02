const jobCategory = require("../controllers/careers/jobCategory");
const jobSection =require("../controllers/careers/jobSection");
const jobApplication=require("../controllers/careers/jobApplication")
const multer = require("multer");
// Set up multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
    next();
  });


  app.post("/skyTrails/api/career/jobcategory", jobCategory.createJobMainCategory);//create main cateogry

  app.post("/skyTrails/api/career/skycategory", jobCategory.createJobCategory);// sky job category

  app.post("/skyTrails/api/career/createjob", jobSection.createOpenings);

  app.get("/skyTrails/api/career/getallopening", jobSection.getAllOpening);

  app.get("/skyTrails/api/career/getopening",jobSection.getOpening);

  app.post("/skyTrails/api/career/applypost",jobApplication.applyJob);

  app.post("/skyTrails/api/career/uploaddocument", upload.single("document"), jobApplication.uploadDocuments);


  app.get("/skyTrails/api/career/getallaplication", jobApplication.getAllApplication)
  
};
