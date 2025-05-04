import { Link } from "react-router-dom";

const AllRoute = () => {
    const links = [
        { title: "Login", url: "/login" },
        { title: "Register", url: "/register" },
        { title: "Chat", url: "/chat" },
        { title: "History", url: "/history" },
        { title: "User Management and Stats", url: "/admin" },
        { title: "Info", url: "/info" },
        { title: "Marks", url: "/marks" },
    ];

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">All Links</h2>
            <ul className="list-disc pl-5">
                {links.map((link, idx) => (
                    <li key={idx}>
                        <Link to={link.url} className="text-blue-500 underline">
                            {link.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AllRoute;
