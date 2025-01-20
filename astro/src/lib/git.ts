import { simpleGit } from "simple-git";

const git = simpleGit("./");
export const getLatestCommitTime = (path: string): Promise<Date | undefined> => {
  return new Promise((resolve, reject) => {
    git.log(["-1", path], (err, log) => {
      if (err) {
        reject(err);
      } else if (log.latest) {
        resolve(new Date(log.latest.date));
      } else {
        resolve(undefined);
      }
    });
  });
};

export const getRemoteUrl = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    git.listRemote(["--get-url"], (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.trim());
      }
    });
  });
};
