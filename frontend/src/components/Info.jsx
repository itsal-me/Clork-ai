const Info = () => {
    const data = {
        name: "M Alif Dewan",
        id: "2221156",
        personal_notion_page:
            "https://www.notion.so/129e180f996e4a26bd722cf6601794e2?pvs=16",
        personal_group_page_notion:
            "https://www.notion.so/129e180f996e4a26bd722cf6601794e2?pvs=16",
        github_id: "itsal-me",
        project_github_link: "https://github.com/itsal-me/Clork-ai",
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
