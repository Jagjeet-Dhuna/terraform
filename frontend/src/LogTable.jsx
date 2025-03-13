import { useState, useMemo } from 'react';
import styled from 'styled-components';
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	getFilteredRowModel,
	flexRender,
} from '@tanstack/react-table';

const TableContainer = styled.div`
	padding: 1rem;
	background: rgba(255, 255, 255, 0.1); /* Base translucent background */
	background: linear-gradient(
		to bottom right,
		rgba(139, 92, 246, 0.3),
		/* Your specified color */ rgba(255, 255, 255, 0.1),
		/* Light translucent background for blending */ rgba(139, 92, 246, 0.3)
			/* Slightly lighter shade to enhance the glass effect */
	);
	border-radius: 0.5rem;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
	backdrop-filter: blur(10px); /* Adds the frosted glass effect */
	border: 1px solid rgba(255, 255, 255, 0.2); /* Optional border to enhance the glass effect */
`;

const FilterContainer = styled.div`
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
	margin-bottom: 1rem;
`;

const FilterInput = styled.input`
	padding: 0.5rem;
	border-radius: 0.25rem;
	border: 1px solid rgba(255, 255, 255, 0.3);
	background-color: rgba(255, 255, 255, 0.8);
	color: #6c6c6c; /* Gray text color */
	transition: all 0.3s ease;

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
	}
`;

const ScrollContainer = styled.div`
	overflow: hidden;
	border-radius: 0.5rem;
`;

const StyledTable = styled.table`
	width: 100%;
	background-color: rgba(255, 255, 255, 0.2);
	backdrop-filter: blur(10px);
	border-collapse: separate;
	border-spacing: 0;
`;

const TableHead = styled.thead`
	background-color: rgba(139, 92, 246, 0.8);
	position: sticky;
	top: 0;
	z-index: 1;
`;

const TableHeader = styled.th`
	padding: 1rem;
	text-align: left;
	color: white;
	font-weight: 600;
	cursor: pointer;
	transition: background-color 0.3s ease;

	&:hover {
		background-color: rgba(139, 92, 246, 1);
	}
`;

const TableBody = styled.tbody`
	display: block;
	max-height: 400px;
	overflow-y: auto;
`;

const TableRow = styled.tr`
	display: table;
	width: 100%;
	table-layout: fixed;

	&:nth-child(even) {
		background-color: rgba(255, 255, 255, 0.1);
	}

	&:hover {
		background-color: rgba(255, 255, 255, 0.2);
	}
`;

const TableCell = styled.td`
	padding: 1rem;
	color: white;
`;

const columns = [
	{
		accessorKey: 'id',
		header: 'ID',
		enableSorting: true,
	},
	{
		accessorKey: 'pod_name',
		header: 'Pod Name',
		enableSorting: true,
	},
	{
		accessorKey: 'local_time',
		header: 'Local Time',
		enableSorting: true,
		cell: (info) => new Date(info.getValue()).toLocaleString(),
	},
	{
		accessorKey: 'version',
		header: 'Version',
		enableSorting: true,
	},
	{
		accessorKey: 'environment',
		header: 'Environment',
		enableSorting: true,
	},
];

const LogTable = ({ data }) => {
	const [filters, setFilters] = useState({
		pod_name: '',
		version: '',
		environment: '',
	});

	const filteredData = useMemo(() => {
		if (!Array.isArray(data)) return [];
		return data.filter((row) => {
			const { pod_name, version, environment } = filters;
			return (
				(!pod_name || row.pod_name.toLowerCase().includes(pod_name.toLowerCase())) &&
				(!version || row.version.toLowerCase().includes(version.toLowerCase())) &&
				(!environment || row.environment.toLowerCase().includes(environment.toLowerCase()))
			);
		});
	}, [data, filters]);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const table = useReactTable({
		data: filteredData,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
	});

	return (
		<TableContainer>
			<FilterContainer>
				<FilterInput
					type="text"
					name="pod_name"
					value={filters.pod_name}
					onChange={handleFilterChange}
					placeholder="Filter by Pod Name"
				/>
				<FilterInput
					type="text"
					name="version"
					value={filters.version}
					onChange={handleFilterChange}
					placeholder="Filter by Version"
				/>
				<FilterInput
					type="text"
					name="environment"
					value={filters.environment}
					onChange={handleFilterChange}
					placeholder="Filter by Environment"
				/>
			</FilterContainer>
			<ScrollContainer>
				<StyledTable>
					<TableHead>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHeader key={header.id} onClick={header.column.getToggleSortingHandler()}>
										{flexRender(header.column.columnDef.header, header.getContext())}
										<span>{{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}</span>
									</TableHeader>
								))}
							</TableRow>
						))}
					</TableHead>
					<TableBody>
						{table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</StyledTable>
			</ScrollContainer>
		</TableContainer>
	);
};

export default LogTable;
