export namespace process {
  export namespace global {
    export namespace NodeJS {
      export type MemoryUsage = {
        /**
         * Resident Set Size, is the amount of space occupied in the main memory device (that is a subset of the total allocated memory) for the
         * process, including all C++ and JavaScript objects and code.
         */
        rss: number;

        /**
         * Refers to V8's memory usage.
         */
        heapTotal: number;

        /**
         * Refers to V8's memory usage.
         */
        heapUsed: number;
        external: number;

        /**
         * Refers to memory allocated for `ArrayBuffer`s and `SharedArrayBuffer`s, including all Node.js Buffers. This is also included
         * in the external value. When Node.js is used as an embedded library, this value may be `0` because allocations for `ArrayBuffer`s
         * may not be tracked in that case.
         */
        arrayBuffers: number;
      };
    }
  }
}
