import React from "react";

const CommonTable = ({ tableData }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            {tableData &&
              Object.keys(tableData)[0].map((header) => {
                return <th>{header}</th>;
              })}
          </tr>
        </thead>
        <tbody>
          {tableData &&
            tableData.map((body, index) => {
              return (
                <tr>
                  {Object.keys(body).map((item) => {
                    return (
                      <td>
                        {item === "status" ? (
                          <button>Button Click</button>
                        ) : (
                          tableData[index][item]
                        )}{" "}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};
export default CommonTable;
