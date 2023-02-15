import React, { useState } from "react";
import { useModal } from "../lib";

function SecondModalScreen(props) {
  const { hideAllModals } = useModal();
  const [counter, setCounter] = useState(0);
  return (
    <>
      <p>Second Modal: {counter}</p>
      <label>Props:</label>
      <code className="theme-pre">{JSON.stringify(props, null, 2)}</code>
      <button onClick={(e) => hideAllModals()}>Close All</button>
      <button onClick={e => setCounter(p => p + 1)}>Increment counter</button>
    </>
  );
}

export default SecondModalScreen;
