import { useParams } from "react-router-dom";
import destinations from "../data/destinations.json";

function DestinationPage() {
    const { id } = useParams();
    const destination = destinations.find((item) => item.id === Number(id));

    if (!destination) {
        return <p>Destination introuvable.</p>;
    }

    return (
        <main className={"destination-page"}>
            <h1>{destination.universityName}</h1>
            <p>Pays : {destination.country}</p>
            <p>Ville : {destination.location}</p>
            <p>Type d'échange : {destination.exchangeType}</p>
            <p>Langues : {destination.languages.join(", ")}</p>
            <a href={destination.url} target="_blank" rel="noreferrer">
                Visiter le site officiel
            </a>
        </main>
    );
}

export default DestinationPage;
