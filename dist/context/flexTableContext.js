"use client";
import { createContext, useContext } from "react";

const FlexTableContext = createContext();

export const FlexTableProvider = ({ children }) => {
  return (
    <FlexTableContext.Provider value={{}}>{children}</FlexTableContext.Provider>
  );
};

export const useFlexTable = () => {
  const context = useContext(FlexTableContext);
  if (!context) {
    throw new Error("useFlexTable must be used within a FlexTableProvider");
  }
  return context;
};
