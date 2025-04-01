class VideoStreamer {
  videoEl;
  mediaSource;

  constructor(videoEl) {
    this.videoEl = videoEl;
    this.mediaSource;

    this.fetching = false;
    this.rolling = false;
    this.rollingThreshold = 60;
    this.rollUrl = "./frag_bunny.mp4";

    // this.initPlayer();
  }

  /********************************************
   * Initialization
   ********************************************/
  async initPlayer() {
    this.mediaSource = await this.setMediaSource();
    this.getSourceBuffer();
    // console.log(res);
  }

  setMediaSource() {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/MediaSource#examples
    const videoEl = this.videoEl;

    const mediaSource = new MediaSource();
    const objUrl = URL.createObjectURL(mediaSource);

    const res = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject("media source timeout");
        mediaSource.removeEventListener("sourceopen", resolver, { once: true });
      }, 2000);

      async function resolver() {
        console.log("sourceopen");
        // videoEl.mediaSource = mediaSource;
        resolve(mediaSource);
        clearTimeout(timeout);
      }

      mediaSource.addEventListener("sourceopen", resolver, { once: true });
    });

    videoEl.src = objUrl;

    return res;
  }

  getSourceBuffer() {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaSource/addSourceBuffer#examples
    const mediaSource = this.mediaSource;
    // get errors if adding multiple buffers
    if (mediaSource?.sourceBuffers?.length >= 1) {
      return mediaSource.sourceBuffers[0];
    } else {
      const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
      const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
      return sourceBuffer;
    }
  }

  /********************************************
   * Rolling
   ********************************************/
  initRolling() {
    if (!this.rolling) {
      this.rolling = true;
      this.roll = this.roll.bind(this);
      this.videoEl.addEventListener("timeupdate", this.roll);
    }
  }
  stopRolling() {
    this.videoEl.removeEventListener("timeupdate", this.roll);
    this.rolling = false;
  }

  async roll(event) {
    const threshold = this.videoEl.buffered.end(0) - this.rollingThreshold;
    if (this.videoEl.currentTime >= threshold && !this.fetching) {
      const res = await this.streamVideo(this.rollUrl);
      console.log(res);
    }
  }

  /********************************************
   * Stream
   ********************************************/

  async streamVideo(srcUrl, timestampOffset) {
    this.fetching = true;
    const start = Date.now();
    if (!this.mediaSource) {
      await this.initPlayer();
    }
    const response = await this.fetchSegment(srcUrl);
    const fetchCompleted = Date.now();
    const result = await this.appendStream(response.body, timestampOffset);
    const appendCompleted = Date.now();
    this.fetching = false;
    return {
      //   start,
      totalTime: appendCompleted - start,
      fetchTime: fetchCompleted - start,
      appendTime: appendCompleted - fetchCompleted,
      response,
      ...result,
    };
  }

  async fetchSegment(srcUrl) {
    const response = await fetch(srcUrl);
    // const contentLength = response.headers.get("Content-Length");
    // console.log(url, "contentLength", contentLength);
    return response;
  }

  async appendStream(stream, timestampOffset = 0) {
    const sourceBuffer = this.getSourceBuffer();
    // const videoEl = this.videoEl;
    // const stream = response.body;

    let bufferedBytes = 0;
    if (!timestampOffset && sourceBuffer.buffered.length) {
      timestampOffset = sourceBuffer.buffered.end(0);
    }
    sourceBuffer.timestampOffset = timestampOffset;

    // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
    // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#examples
    const reader = stream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      bufferedBytes += value.byteLength;
      try {
        await this.addChunk(value);
      } catch (err) {
        if (err?.name === "QuotaExceededError") {
          await this.trimBuffer();
          await this.addChunk(value);
        } else {
          throw err;
        }
      }
    }
    this.handleEnd();
    const end = sourceBuffer.buffered.end(0);
    const results = {
      bytes: bufferedBytes,
      //   srcUrl: response.url,
      // bufferStart: sourceBuffer.buffered.start(0),
      // bufferEnd: sourceBuffer.buffered.end(0),
      segmentStart: timestampOffset,
      segmentEnd: end,
      segmentDuration: end - timestampOffset,
    };
    return results;
  }

  addChunk(chunk) {
    const sourceBuffer = this.getSourceBuffer();

    // https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/appendBuffer
    // console.log("chunky");
    return new Promise(async (resolve, reject) => {
      try {
        sourceBuffer.appendBuffer(chunk);
        sourceBuffer.addEventListener(
          "updateend",
          () => {
            resolve(true);
          },
          { once: true }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  async trimBuffer(duration = 30, fromStart = true) {
    const sourceBuffer = this.getSourceBuffer();
    let start,
      end = 0;
    if (fromStart) {
      start = sourceBuffer.buffered.start(0);
      end = start + duration;
    } else {
      end = sourceBuffer.buffered.end(0);
      start = end - duration;
    }
    await this.removeBuffer(start, end);
  }

  removeBuffer(start, end) {
    const sourceBuffer = this.getSourceBuffer();

    return new Promise((resolve, reject) => {
      try {
        sourceBuffer.remove(start, end);
        sourceBuffer.addEventListener(
          "updateend",
          () => {
            resolve(true);
          },
          { once: true }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  handleEnd() {
    const mediaSource = this.mediaSource;
    if (mediaSource.readyState === "open") {
      mediaSource.endOfStream();
    }
  }
}

export default VideoStreamer;

// export async function sleep(ms) {
//   const promise = new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve();
//     }, ms);
//   });
//   return promise;
// }
