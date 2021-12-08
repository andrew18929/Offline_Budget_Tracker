let db;
let budgetV;

// create a request for a new database
const request = indexedDB.open("BudTrackDB", budgetV || 1);

request.onupgradeneeded = function (event) {
  console.log("There needs to be an upgrade in IndexDB");

  const { oldV } = event;
  const newV = event.newV || db.version;

  console.log(`Database updated from version ${oldV} to ${newV}`);

  db = event.target.result;
  if (db.objectStoreNames.length === 0) {
    db.createObjectStore("BudgetTransaction", { autoIncrement: true });
  }
};

request.onerror = function (event) {
  console.log(`Sorry! ${event.target.errorCode}`);
};

// function to checkDatabaseTransaction

// open a transaction on BudgetTransaction

// access BudgetTransaction object

// retrieve all records on BudgetTransaction and assign to a variable

// check to see if the request was successful

// if there were records, add them when the app is back online

// if the response came back with records

// start another BudgetTransaction

// assign the current transaction to a variable

// if current transaction add was successful, make sure to clear entries

// log to see if successful

// make sure application is online before checking database

// function to save transaction

// create a transaction on the BudgetTransaction database

// access BudgetTransaction object store

// add records to store

// addEventListener to see if app is back online
