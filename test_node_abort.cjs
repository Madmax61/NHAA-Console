const ac = new AbortController();
const signal = ac.signal;
ac.abort("signal is aborted without reason");
console.log(signal.reason);
