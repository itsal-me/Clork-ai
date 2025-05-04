// src/pages/Marks.jsx
import * as d3 from "d3";
import { useEffect, useRef } from "react";

const Marks = () => {
    const tableRef = useRef();

    useEffect(() => {
        const data = [
            {
                mark: "5",
                justification:
                    "Added admin section to view all users, can manage them, follow stats",
                internal: "/admin",
            },
            {
                mark: "5",
                justification:
                    "User specific Chat history page with all messages for the user",
                internal: "/history",
            },
            {
                mark: "5",
                justification:
                    "Filter the model response, it will response if only user asked for any Film script. Otherwise it will not respond.",
                internal: "/chat",
            },
        ];

        const table = d3.select(tableRef.current);
        table.selectAll("*").remove(); // Clear on rerender

        const thead = table.append("thead");
        const tbody = table.append("tbody");

        const headers = [
            "mark",
            "justification for this marking",
            "internal route",
        ];
        thead
            .append("tr")
            .selectAll("th")
            .data(headers)
            .enter()
            .append("th")
            .attr("class", "px-4 py-2 bg-gray-200 text-left border")
            .text((d) => d);

        const rows = tbody.selectAll("tr").data(data).enter().append("tr");

        rows.selectAll("td")
            .data((d) => [d.mark, d.justification, d.internal])
            .enter()
            .append("td")
            .attr("class", "px-4 py-2 border")
            .text((d) => d);
    }, []);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center">
                Marks Evaluation
            </h2>
            <table
                ref={tableRef}
                className="w-full table-auto border-collapse border border-gray-400"
            />
        </div>
    );
};

export default Marks;
