import Model from "./Model";
import ORMConfig from "./ORMConfig";
import Repo from "./Repo";
import { SQL } from "./connection/SQL";

export default class ORM {

    private static repos: Repo<Model>[] = []

    public static getRepo<T extends Model>(model: any): Repo<T>|null {
        return (this.repos.find(r => r.getInfo().getModel() == model) || null) as Repo<T>
    }

    public static getRepos(): Repo<Model>[] {
        return this.repos
    }

    public static register(model: any, connection: SQL, config: ORMConfig): Repo<Model> {
        if(this.getRepo(model)) {
            throw new Error(`Model '${model.name}' already registered!`)
        }
        const repo = new Repo(model, connection, config)
        this.repos.push(repo)
        return repo
    }

    public static async close(): Promise<void> {
        for(let repo of this.repos) {
            await repo.close()
        }
    }

}