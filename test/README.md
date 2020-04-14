# How to to run the tests and find out your points

> Please note that due to differences between platforms, it is possible that the results you get locally on your machine differ from those shown on GitHub. What counts for your grade are the points you see on GitHub. Also note that for the final grading, we will run a modified test suite which might include additional tests not present here.

## Locally (on your own computer)

To run the tests, you need to have [Node.js](https://nodejs.org) installed. We recommend the latest version (13.12).

1. Navigate to the `test` directory.

2. If this is the first time running the tests, install the required dependencies with `npm install`.

3. Run the test suite with `npm test`. After all tests have run, it will print out your point total. For details, see the generated `report.html` file.

## On GitHub

Every time you push a commit to GitHub, the tests will be run automatically. To see the results, you have to go to your repository on GitHub and click on the *Actions* tab. There you will see all past test runs. Click on the latest run and look at the *Artifacts* field to download the test report.

# How to run a development web server

Due to browser security features such as CORS, it can be quite a hassle to develop websites purely with static files. For your convenience, you can start a local web server serving the `www` directory by issuing the following command inside the `test` directory:

    npm run server
