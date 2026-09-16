const nodeUtil = require('util');

global.TextEncoder = nodeUtil.TextEncoder;
global.TextDecoder = nodeUtil.TextDecoder;
globalThis.TextEncoder = nodeUtil.TextEncoder;
globalThis.TextDecoder = nodeUtil.TextDecoder;

const nodeStreamWeb = require('stream/web');

global.ReadableStream = nodeStreamWeb.ReadableStream;
global.WritableStream = nodeStreamWeb.WritableStream;
global.TransformStream = nodeStreamWeb.TransformStream;
globalThis.ReadableStream = nodeStreamWeb.ReadableStream;
globalThis.WritableStream = nodeStreamWeb.WritableStream;
globalThis.TransformStream = nodeStreamWeb.TransformStream;

const nodeWorkerThreads = require('worker_threads');

class AutoUnrefMessageChannel {
  constructor() {
    const channel = new nodeWorkerThreads.MessageChannel();
    if (typeof channel.port1.unref === 'function') {
      channel.port1.unref();
    }
    if (typeof channel.port2.unref === 'function') {
      channel.port2.unref();
    }
    return channel;
  }
}

global.MessagePort = nodeWorkerThreads.MessagePort;
global.MessageChannel = AutoUnrefMessageChannel;
globalThis.MessagePort = nodeWorkerThreads.MessagePort;
globalThis.MessageChannel = AutoUnrefMessageChannel;

const undiciModule = require('undici');

global.Response = undiciModule.Response;
global.Request = undiciModule.Request;
global.Headers = undiciModule.Headers;
global.fetch = undiciModule.fetch;

globalThis.Response = undiciModule.Response;
globalThis.Request = undiciModule.Request;
globalThis.Headers = undiciModule.Headers;
globalThis.fetch = undiciModule.fetch;
