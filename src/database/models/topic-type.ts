import { Model, DataTypes } from 'sequelize';
import appSequelize from '../app-sequelize';

export enum TopicTypeLookup {
    HOMEWORK = 1,
    EXAM = 2,
}

export default class TopicType extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public name!: string;
    public active!: boolean;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

TopicType.init({
    id: {
        field: 'topic_type_id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    active: {
        field: 'topic_type_active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    name: {
        field: 'topic_type_name',
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'topic_type',
    sequelize: appSequelize, // this bit is important
});
