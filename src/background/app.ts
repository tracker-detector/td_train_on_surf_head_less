import browser from "webextension-polyfill";
import { injectable, inject } from "inversify";
import * as tf from "@tensorflow/tfjs";
import {
  IApp,
  type ITPLService,
  TYPES,
  type IExtractor,
  type IAsyncQueue,
  type IModel,
  type ISampler,
  type ISettings,
  type IStats,
  type IMessages,
  type ICrawler,
} from "./types";

@injectable()
class App implements IApp {
  private static readonly URL_FILTER = { urls: ["http://*/*", "https://*/*"] };
  constructor(
    @inject(TYPES.ITPLService) private tplService: ITPLService,
    @inject(TYPES.IExtractor) private featureExtractor: IExtractor,
    @inject(TYPES.IAsyncQueue) private queue: IAsyncQueue,
    @inject(TYPES.IModel) private model: IModel,
    @inject(TYPES.ISampler) private sampler: ISampler,
    @inject(TYPES.ISettings) private settings: ISettings,
    @inject(TYPES.IStats) private stats: IStats,
    @inject(TYPES.IMessages) private messages: IMessages,
    @inject(TYPES.ICrawler) private crawler: ICrawler
  ) {}

  start(): void {
    setInterval(async () => {
      if (this.settings.finished) {
        await this.model.export();
        this.settings.finished = false;
      }
    }, 200);
    browser.webRequest.onBeforeSendHeaders.addListener(
      (details) => {
        const label = this.tplService.classify(details);
        if (label) {
          this.sampler.addTracker(details);
        }
        const featureVector = this.featureExtractor.extract(details);
        const result = this.model.predict(tf.reshape(featureVector, [1, 203]));
        this.stats.addRequests(details, label, result);
        this.queue.enqueue(details, label);
        const [isActive, ids] = this.crawler.isActive();
        if (isActive) {
          console.log("Crawl active");
          if (ids.includes(details.tabId)) {
            console.log("Request from crawl allowed");
            return { cancel: false };
          }
        }
        if (this.settings.modelActive) {
          return {
            cancel:
              result >= this.settings.blockingRate &&
              this.settings.blockingActive,
          };
        } else {
          return { cancel: label && this.settings.blockingActive };
        }
      },
      App.URL_FILTER,
      ["requestHeaders", "blocking"]
    );
    this.messages.listen();
    console.log("Application Started");
  }
}

export { App };
