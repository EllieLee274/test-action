import { getInput, setSecret, setFailed } from "@actions/core";
import { exec } from "@actions/exec";
import * as os from "os";
import { promises as fs } from "fs";

async function run() {
  try {
    const siteName = getInput("site-name");
    const branch = getInput("branch");
    const ref = getInput("ref");
    const env = getInput("env");
    const clientId = process.env.CLIENT_ID;
    setSecret(clientId);
    const clientSecret = process.env.CLIENT_SECRET;
    setSecret(clientSecret);

    if (!branch && !ref) {
      throw new Error(
        "You must include at least a branch or git ref for deployment source code"
      );
    }
    if (!branch && !env) {
      throw new Error("You must include an environment name to be deployed to");
    }

    const ALTITUDE_DIR_LOCATION = `${os.homedir()}/.altitude`;
    const CREDENTIALS_LOCATION = `${ALTITUDE_DIR_LOCATION}/credentials`;

    const writeAuthCreds = async (creds) => {
      await fs.mkdir(ALTITUDE_DIR_LOCATION);

      return fs.writeFile(
        CREDENTIALS_LOCATION,
        JSON.stringify(creds, undefined, 2)
      );
    };

    await writeAuthCreds({ client_id: clientId, secret_key: clientSecret });

    const branchOrRef = branch ? `--branch ${branch}` : `--ref ${ref}`;

    const envFlag = env ? `--env ${env}` : "";

    await exec(
      `npx @thg-altitude/cli altitude deploy --site ${siteName} ${branchOrRef} ${envFlag}`
    ).then(() => {
      process.exit();
    });
  } catch (error) {
    setFailed(error.message);
  }
}

run();
