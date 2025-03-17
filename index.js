import { input } from "@inquirer/prompts";
import inquirer from "inquirer";
import puppeteer from "puppeteer";

const { currentPosition, destination, customHour } = await inquirer.prompt([
  {
    type: "input",
    name: "currentPosition",
    message: "Enter your current position: ",
  },
  {
    type: "input",
    name: "destination",
    message: "Enter your destination: ",
  },
  {
    type: "input",
    name: "hourDecision",
    message: "1) Current Hour, 2) Input custom hour",
  },
  {
    type: "input",
    name: "customHour",
    message: "Insert the hour: ",
    when: (answers) => answers.hourDecision === "2",
  },
]);

scrapePage(currentPosition, destination, customHour);

// that's the main function that does the scraping
async function scrapePage(currentPosition, destination, customHour) {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
    });
    const page = await browser.newPage();

    const url = `https://www.google.com/maps/dir/${encodeURIComponent(
      currentPosition
    )}/${encodeURIComponent(destination)}/`;

    await page.goto(url, { waitUntil: "networkidle2" });

    removeGoogleForm(page);

    await page.waitForSelector(".OzmNAc.google-symbols.SwaGS");
    const icons = await page.$$(".OzmNAc.google-symbols.SwaGS");

    await icons[1].click(); // clicking transit

    if (customHour) {
      await page.click(".goog-inline-block.goog-menu-button.Ab1Xue.htlfU");

      await page.waitForSelector(".goog-menuitem");
      const dropDownList = await page.$$(".goog-menuitem");
      await dropDownList[1].click();

      const inputField = ".LgGJQc";
      await page.waitForSelector(inputField);

      await page.focus(inputField);
      await page.keyboard.down("Control");
      await page.keyboard.press("A");
      await page.keyboard.up("Control");
      await page.keyboard.press("Backspace");
      // clearing the input field and replacing with the custom hour given by the user

      await page.type(inputField, customHour);
      await page.keyboard.press("Enter");
    }
  } catch (error) {
    console.error("Something went wrong! ", error);
  }
}

// function that rejects the google popup form
async function removeGoogleForm(page) {
  try {
    await page.evaluate(() => {
      const wrapper = document.querySelector(".CxJub > .VtwTSb");
      const forms = wrapper.querySelectorAll("form");
      if (forms.length > 0) {
        forms[0].submit();
      }
    });
  } catch (error) {
    console.error("Error occurred during page evaluation:", error);
  }
}
