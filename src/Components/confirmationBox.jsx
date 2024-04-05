import React from "react";
import close from "../Images/closeS.png";

const ConfirmationBox = ({ title, message, yesClick, noClick }) => {
  return (
    <div
      className="role_content"
      style={{
        width: "30%",
        height: "200px",
        fontSize: "smaller",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <img
        src={close}
        alt=""
        width={10}
        style={{ position: "relative", right: "-45%" }}
        onClick={() => noClick()}
      ></img>
      <h3>{title}</h3>
      <p>{message}</p>
      <div>
        {" "}
        <button
          className="btn btn-primary mb-3 bootstarapModificationButton"
          onClick={() => noClick()}
        >
          No
        </button>{" "}
        &nbsp;&nbsp;{" "}
        <button
          className="btn btn-danger mb-3 bootstarapModificationButton"
          onClick={() => yesClick()}
        >
          Yes
        </button>
      </div>
    </div>
  );
};
export default ConfirmationBox;
