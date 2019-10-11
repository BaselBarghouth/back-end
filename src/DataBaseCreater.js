const readline = require("readline");
const sqlite = require("sqlite");
const createConstants = require("./config");
const readlineInterface = readline.createInterface(
  process.stdin,
  process.stdout
);

function ask(questionText) {
  return new Promise((resolve, reject) => {
    readlineInterface.question(questionText, resolve);
  });
}
const TYPES = ["INTEGER", "TEXT", "REAL", "BLOB", "NUMERIC"];
const ATTRIBUTE = ["NOT NULL", "PRIMARY KEY", "UNIQUE"];

const printArray = array => {
  array.forEach((element, index) => {
    console.log(`${index + 1}-${element}`);
  });
};

const creatingDataBase = async () => {
  let primaryKeys = [];
  const dataBaseName = await ask("What is your dataBase name?\n");
  const numberOfTables = await ask(
    `How many tables do you have in ${dataBaseName}?\n`
  );
  var tablesName = [];
  var columns = [];
  var columnDetails = {};
  for (let i = 1; i <= numberOfTables; i++) {
    const tableName = await ask(
      `What is the name of your ${i} table in ${dataBaseName}?\n`
    );
    tablesName = [...tablesName, tableName];
    const columnNumber = await ask(
      `How many columns do you have in ${tableName}?\n`
    );
    for (let l = 1; l <= columnNumber; l++) {
      const columnName = await ask(
        `What is the name of your ${l} column in ${tableName}?\n`
      );
      columnDetails[columnName] = "";
      const columnType = await ask(
        `What is the type for this column (Plz put spaces between them)?\n`,
        printArray(TYPES)
      );
      let ar = columnType.trim().split(" ");
      if (ar.length === 1) {
        columnDetails[columnName] += TYPES[ar[0] - 1] + " ";
      }
      if (ar.length > 1) {
        let temp = "";
        ar.forEach(element => {
          temp += TYPES[element - 1] + " ";
        });
        columnDetails[columnName] += temp;
      }

      const columnAttribute = await ask(
        `Plz chosse the number of attributes you want for this table${tableName}(Plz put spaces between them)?\n `,
        printArray(ATTRIBUTE)
      );
      let ar1 = columnAttribute.trim().split(" ");
      if (ar1.length === 1) {
        if (ar1[0] === 1) primaryKeys.push(columnName);
        columnDetails[columnName] += ATTRIBUTE[ar1[0] - 1] + " ";
      }
      if (ar1.length > 1) {
        let temp1 = "";
        ar1.forEach(element => {
          if (element === 1) primaryKeys.push(columnName);
          temp1 = temp1 + ATTRIBUTE[element - 1] + " ";
        });

        columnDetails[columnName] += temp1;
      }
    }
    columns = [...columns, columnDetails];
    columnDetails = {};
  }
  console.log(columns);
  let queries = columns.map((item, index) => {
    let columns1 = Object.keys(item);
    let query = `CREATE TABLE ${tablesName[index]} (`;

    columns1.map((column, index) => {
      query += `${column} ${item[column]}`;
      query += index + 1 === columns1.length ? ");" : ", ";
    });

    return query;
  });

  let numberOfRelations = await ask(
    `How many relations do you have in the ?\n`
  );
  var relations = {};
  if (numberOfRelations === 0) {
  } else {
    for (let i = 1; i <= numberOfRelations; i++) {
      let temp1 = await ask(
        `what is the name of the table in relation ${i}?\n`
      );
      let temp2 = await ask(`Whow is the refrence ${i}?\n`);
      let temp3 = await ask(`What is the FOREIGN KEY${i}?\n`);
      relations[i] = [temp1, temp2, temp3];
    }
    let relationsTable = Object.values(relations).map((item, index) => {
      return item[0];
    });
    let FOREIGNsKEY = Object.values(relations).map((item, index) => {
      return item[2];
    });
    let refrences = Object.values(relations).map((item, index) => {
      return item[1];
    });
    var newStmts = [];
    for (let key in relationsTable) {
      let addColumn = `ALTER TABLE ${relationsTable[key]} ADD COLUMN ${FOREIGNsKEY[key]} REFERENCES ${refrences[key]}(${FOREIGNsKEY[key]}) ;`;
      newStmts.push(addColumn);
    }
  }
  if (queries.length > 0) {
    let db = await sqlite.open(`./${dataBaseName}.sqlite`);
    for (let key in queries) {
      try {
        let sql = await db.run(queries[key]);
        console.log(sql);
      } catch (err) {
        console.log("===e===>", err);
      }
    }

    for (let key in newStmts) {
      try {
        let sql = await db.run(newStmts[key]);
        console.log(sql);
      } catch (err) {
        console.log("===e1===>", err);
      }
    }
  }
  let id_es = {};
  for (let i = 0; i < tablesName.length; i++) {
    id_es[tablesName[i]] = primaryKeys[i];
  }
  let tablesApi = tablesName.map(i => {
    return `app.use("/${i}",router);`;
  });
  let relationsApi = Object.values(relations).map(i => {
    return `app.use("/v1/${i[0]}/${i[1]}",router);`;
  });
  let ApiAll = relationsApi.concat(tablesApi);
  let Api = "";
  ApiAll.forEach(element => {
    Api += element;
  });
  createConstants(id_es, Api, dataBaseName);
};
creatingDataBase();
