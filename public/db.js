let db;
const request = indexedDB.open("BudTrackDB", 1);

request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createObjectStore("BudgetTransaction", { autoIncrement: true });
  console.log("There needs to be an upgrade in IndexDB");
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabaseTransaction();
  }
};

request.onerror = function (event) {
  console.log(`Sorry! ${event.target.errorCode}`);
};

// function to checkDatabaseTransaction
function checkDatabaseTransaction() {
  // open a transaction on BudgetTransaction
  let transaction = db.transaction(["BudgetTransaction"], "readwrite");

  // access BudgetTransaction object
  const transactionStore = transaction.objectStore("BudgetTransaction");

  // retrieve all records on BudgetTransaction and assign to a variable
  const getAll = transactionStore.getAll();

  // check to see if the request was successful
  getAll.onsuccess = function () {
    // if there were records, add them when the app is back online
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          // if the response came back with records
          if (serverResponse.length !== 0) {
            // start another BudgetTransaction
            transaction = db.transaction(["BudgetTransaction"], "readwrite");

            // assign the current transaction to a variable
            const currentTransactionStore =
              transaction.objectStore("BudgetTransaction");

            // if current transaction add was successful, make sure to clear entries
            currentTransactionStore.clear();
          }
        });
    }
  };
}

// log to see if successful
request.onsuccess = function (event) {
  console.log("successful attempt");
  db = event.target.result;

  // make sure application is online before checking database
  if (navigator.onLine) {
    console.log("Online!");
    checkDatabaseTransaction();
  }
};

// function to save transaction
const saveRecord = (record) => {
  // create a transaction on the BudgetTransaction database
  const transaction = db.transaction(["BudgetTransaction"], "readwrite");

  // access BudgetTransaction object store
  const transactionStore = transaction.objectStore("BudgetTransaction");

  // add records to store
  transactionStore.add(record);
};

// addEventListener to see if app is back online
window.addEventListener("online", checkDatabaseTransaction);
