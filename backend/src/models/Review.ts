import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Tenant } from "./Tenant";
import { Property } from "./Property";

@Entity("reviews")
export class Review {
    @PrimaryGeneratedColumn("uuid")
    review_id!: string;

    @Column("text")
    comment!: string;

    @Column("decimal", { precision: 2, scale: 1 })
    rating!: number;

    @ManyToOne(() => Tenant, { onDelete: "CASCADE" })
    @JoinColumn({ name: "author_id" })
    author!: Tenant;

    @ManyToOne(() => Property, { onDelete: "CASCADE" })
    @JoinColumn({ name: "property_id" })
    property!: Property;

    @CreateDateColumn()
    created_at!: Date;
}
