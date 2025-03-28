class VideoStreamer {
  videoEl;
  mediaSource;

  constructor(videoEl) {
    this.videoEl = videoEl;
    this.mediaSource;
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
      }, 1000);

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
   * Stream
   ********************************************/

  async streamVideo(srcUrl, timestampOffset) {
    const start = Date.now();
    if (!this.mediaSource) {
      await this.initPlayer();
    }
    const response = await this.fetchSegment(srcUrl);
    const res = await this.appendStream(response, timestampOffset);

    return {
    //   start,
      delay: Date.now() - start,
      ...res,
    };
  }

  async fetchSegment(srcUrl) {
    const response = await fetch(srcUrl);
    // const contentLength = response.headers.get("Content-Length");
    // console.log(url, "contentLength", contentLength);
    return response;
  }

  async appendStream(response, timestampOffset) {
    const sourceBuffer = this.getSourceBuffer();
    const videoEl = this.videoEl;
    const stream = response.body;

    let bufferedBytes = 0;
    if (timestampOffset) {
      sourceBuffer.timestampOffset = timestampOffset;
    } else if (videoEl.duration && videoEl.duration !== Infinity) {
      sourceBuffer.timestampOffset = videoEl.duration;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams
    // https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream#examples
    const reader = stream.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      bufferedBytes += value.byteLength;
      await this.addChunk(sourceBuffer, value);
    }

    this.handleEnd();
    const results = {
      bytes: bufferedBytes,
      srcUrl: response.url,
      bufferStart: sourceBuffer.buffered.start(0),
      bufferEnd: sourceBuffer.buffered.end(0),
    };
    return results;
  }

  addChunk(sourceBuffer, chunk) {
    // https://developer.mozilla.org/en-US/docs/Web/API/SourceBuffer/appendBuffer
    // console.log("chunky");
    return new Promise((resolve, reject) => {
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
