import { Model, DataTypes, BelongsToGetAssociationMixin, Sequelize } from 'sequelize';
import appSequelize from '../app-sequelize';

export default class User extends Model {
  public id!: number; // Note that the `null assertion` `!` is required in strict mode.
  public active!: boolean;
  public universityId!: number;
  // TODO: Make this an enum when adding administrators.
  public roleId!: number;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public password!: string;
  public verifyToken?: string | null;
  public verifyTokenExpiresAt!: Date;
  public verified!: boolean;
  public actuallyVerified!: boolean;
  public preferredEmail!: string;
  public preferredEmailInstitutionVerificationToken?: string;
  public preferredEmailInstitutionVerificationTokenExpiresAt!: Date;
  public preferredEmailVerificationToken?: string;
  public preferredEmailVerificationTokenExpiresAt!: Date;
  public forgotPasswordToken!: string | null;
  public forgotPasswordTokenExpiresAt!: Date
  public uuid!: string;
  public paidUntil!: Date;

  public courseEnrollments?: StudentEnrollment[]

  public getUniversity!: BelongsToGetAssociationMixin<University>;
  public getRole!: BelongsToGetAssociationMixin<Permission>;

  public readonly university!: University;
  public readonly role!: Permission;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static constraints = {
    uniqueEmail: 'users_user_email_key',
  }

  static createAssociations(): void {
    // This is a hack to add the associations later to avoid cyclic dependencies
    /* eslint-disable @typescript-eslint/no-use-before-define */
    // // Here we associate which actually populates out pre-declared `association` static and other methods.
    // User.hasMany(Session, {
    //   sourceKey: 'id',
    //   foreignKey: 'user_id',
    //   as: 'user' // this determines the name in `associations`!
    // });

    User.belongsTo(Permission, {
      foreignKey: 'roleId',
      targetKey: 'id',
      as: 'role'
    });

    User.belongsTo(University, {
      foreignKey: 'universityId',
      targetKey: 'id',
      as: 'university'
    });

    User.hasMany(StudentEnrollment, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      as: 'courseEnrollments'
    });

    User.hasMany(StudentGrade, {
      foreignKey: 'user_id',
      sourceKey: 'id',
      as: 'grades'
    });
    /* eslint-enable @typescript-eslint/no-use-before-define */
  }
}

User.init({
  id: {
    field: 'user_id',
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  active: {
    field: 'course_topic_question_active',
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  universityId: {
    field: 'university_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roleId: {
    field: 'role_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  firstName: {
    field: 'user_first_name',
    type: DataTypes.TEXT,
    allowNull: false,
  },
  lastName: {
    field: 'user_last_name',
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    field: 'user_email',
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  password: {
    field: 'user_password',
    type: DataTypes.TEXT,
    allowNull: false,
  },
  verifyToken: {
    field: 'user_verify_token',
    type: DataTypes.TEXT,
    allowNull: true,
    unique: true
  },
  verified: {
    field: 'user_verified',
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  actuallyVerified: {
    field: 'user_actually_verified',
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  preferredEmail: {
    field: 'user_preferred_email',
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '' // temporary we should drop this
  },
  preferredEmailInstitutionVerificationToken: {
    field: 'user_preferred_email_institution_verification_token',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  preferredEmailVerificationToken: {
    field: 'user_preferred_email_verification_token',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verifyTokenExpiresAt: {
      field: 'user_verify_token_expires_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
  },
  preferredEmailInstitutionVerificationTokenExpiresAt: {
      field: 'user_preferred_email_institution_verification_token_expires_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
  },
  preferredEmailVerificationTokenExpiresAt: {
      field: 'user_preferred_email_verification_token_expires_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
  },
  forgotPasswordToken: {
    field: 'user_forgot_password_token',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  forgotPasswordTokenExpiresAt: {
      field: 'user_forgot_password_token_expires_at',
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('NOW()')
  },
  uuid: {
      field: 'user_uuid',
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      defaultValue: DataTypes.UUIDV4
  },
  paidUntil: {
      field: 'user_paid_until',
	    type: DataTypes.DATE,
	    allowNull: false,
      defaultValue: Sequelize.literal('NOW()'),
  },
}, {
  tableName: 'users',
  sequelize: appSequelize, // this bit is important
});

import University from './university';
// import Session from './session';
import Permission from './permission';
import StudentEnrollment from './student-enrollment';
import StudentGrade from './student-grade';
