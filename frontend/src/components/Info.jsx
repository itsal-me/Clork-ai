const Info = () => {
    const data = {
        name: "Md.Radua Nafiz",
        id: "2221552",
        personal_notion_page:
            "https://www.notion.so/2ff94b6b9c544e07a6b768662d5a7548",
        personal_group_page_notion:
            "https://www.notion.so/2ff94b6b9c544e07a6b768662d5a7548",
        github_id: "Raduannafiz",
        project_github_link: "https://github.com/Raduannafiz",
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Project Info</h2>
            <ul className="list-disc pl-5">
                {Object.entries(data).map(([key, value]) => (
                    <li key={key}>
                        <strong>{key}:</strong> {value}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Info;
