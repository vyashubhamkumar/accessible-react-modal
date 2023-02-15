import React from "react";
import { useModal } from "../lib";
import { ModalTypes } from "./ModalScreens";

function FirstModalScreen(props) {
  const { showModal } = useModal();
  console.log("\nReRender")
  return (
    <>
      <p>FirstModal</p>
      <label>Props:</label>
      <code className="theme-pre">{JSON.stringify(props, null, 2)}</code>
      <button
        onClick={(e) =>
          showModal({
            type: ModalTypes.SECOND,
            props: { text: "anything passed from parent" },
          })
        }
      >
        Open {ModalTypes.SECOND}
      </button>
    </>
  );
}

export default FirstModalScreen;
