  /**
   * 手写promise最佳代码
   */
  class MyPromise {
    constructor(executor) {
      this._state = PENDING;
      this._value = undefined;
      this._reason = undefined;
  
      this._onFulfilledCallbacks = [];
      this._onRejectedCallbacks = [];
  
      const resolve = (value) => {
        if (this._state === PENDING) {
          this._state = FULFILLED;
          this._value = value;
  
          this._onFulfilledCallbacks.forEach((callback) => callback());
        }
      };
  
      const reject = (reason) => {
        if (this._state === PENDING) {
          this._state = REJECTED;
          this._reason = reason;
  
          this._onRejectedCallbacks.forEach((callback) => callback());
        }
      };
  
      try {
        executor(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }
  
    then(onFulfilled, onRejected) {
      onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
      onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason; };
  
      const promise = new MyPromise((resolve, reject) => {
        const handleFulfilled = () => {
          setTimeout(() => {
            try {
              const result = onFulfilled(this._value);
              this._resolvePromise(promise, result, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        };
  
        const handleRejected = () => {
          setTimeout(() => {
            try {
              const result = onRejected(this._reason);
              this._resolvePromise(promise, result, resolve, reject);
            } catch (err) {
              reject(err);
            }
          });
        };
  
        switch (this._state) {
          case FULFILLED:
            handleFulfilled();
            break;
          case REJECTED:
            handleRejected();
            break;
          case PENDING:
            this._onFulfilledCallbacks.push(handleFulfilled);
            this._onRejectedCallbacks.push(handleRejected);
            break;
        }
      });
  
      return promise;
    }
  
    catch(onRejected) {
      return this.then(null, onRejected);
    }
  
    static resolve(value) {
      if (value instanceof MyPromise) {
        return value;
      }
  
      return new MyPromise((resolve) => {
        resolve(value);
      });
    }
  
    static reject(reason) {
      return new MyPromise((resolve, reject) => {
        reject(reason);
      });
    }
  
    static all(promises) {
      return new MyPromise((resolve, reject) => {
        const results = [];
        let remaining = promises.length;
  
        const handleResolve = (index) => (value) => {
          results[index] = value;
          remaining--;
  
          if (remaining === 0) {
            resolve(results);
          }
        };
  
        for (let i = 0; i < promises.length; i++) {
          MyPromise.resolve(promises[i]).then(handleResolve(i), reject);
        }
      });
    }
  
    static race(promises) {
      return new MyPromise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
          MyPromise.resolve(promises[i]).then(resolve, reject);
        }
      });
    }
  
    _resolvePromise(promise, result, resolve, reject) {
      if (promise === result) {
        reject(new TypeError('Chaining cycle detected'));
        return;
      }
  
      if (result instanceof MyPromise) {
        result.then(resolve, reject);
        return;
      }
  
      resolve(result);
    }
  }