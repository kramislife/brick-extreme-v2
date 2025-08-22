import { createBaseColumns } from "./BaseColumns";

export const createInstructionColumns = (
  handleEdit,
  handleDelete,
  isDeleting
) => {
  const customColumns = [
    {
      header: "Title",
      accessorKey: "title",
    },
    {
      header: "Product",
      accessorKey: "productName",
    },
    {
      header: "PDF",
      accessorKey: "url",
      cell: ({ row }) => (
        <a
          href={row.original.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline"
        >
          View
        </a>
      ),
    },
  ];

  return createBaseColumns({
    handleEdit,
    handleDelete,
    isDeleting,
    hasImageUpload: false,
    customColumns,
  });
};
