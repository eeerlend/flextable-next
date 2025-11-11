import { useFlexTable } from "../../dist/context/flexTableContext";
import { FlexTable } from "../../dist/components/flextable/flexTable";
import { FlexTableHead } from "../../dist/components/flextable/flexTableHead";
import { FlexTableBody } from "../../dist/components/flextable/flexTableBody";
import { FlexTableRow } from "../../dist/components/flextable/flexTableRow";
import { FlexTableCell } from "../../dist/components/flextable/flexTableCell";

export const SimpleTable = () => {
  const { rows } = useFlexTable();
  return (
    <FlexTable>
      <FlexTableHead>
        <FlexTableCell>ID</FlexTableCell>
        <FlexTableCell>Name</FlexTableCell>
        <FlexTableCell>Email</FlexTableCell>
      </FlexTableHead>
      <FlexTableBody>
        {rows.map((row) => (
          <FlexTableRow key={row.id}>
            <FlexTableCell>{row.id}</FlexTableCell>
            <FlexTableCell>{row.name}</FlexTableCell>
            <FlexTableCell>{row.email}</FlexTableCell>
          </FlexTableRow>
        ))}
      </FlexTableBody>
    </FlexTable>
  );
};
