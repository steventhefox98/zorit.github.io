import Common "common";

module {
  /// User account record — persisted across upgrades. The optional `avatar`
  /// field has been removed entirely (the avatar feature was deleted); the
  /// upgrade migration consumes any previously-stored avatar value and drops
  /// it from each user record.
  public type User = {
    username : Common.Username;
    passwordHash : Common.PasswordHash;
    role : Role;
  };

  /// Role hierarchy. Steven and Qbhinoor auto-assigned Administrator;
  /// everyone else defaults to Member on registration. The roster rank
  /// variants (#Owner .. #SrCop) are assignable via the two-step
  /// application accept flow and stored on staff roster entries. The
  /// messaging gate (isStaffRole) treats Administrator, CoAdministrator,
  /// and the top-level roster ranks as staff.
  ///
  /// The duplicate Sr-Admin rank variants (#SrAdmin 'SR. ADMIN' and
  /// #SrAdminRank 'Sr-Admin') have been removed. Any users or roster
  /// members previously assigned to either are reassigned to #Admin by
  /// the upgrade migration. A new #Cop rank has been added (positioned
  /// after #Mod, before #SrCop).
  public type Role = {
    #Administrator;
    #CoAdministrator;
    #Member;
    // Roster ranks (assignable via two-step accept, stored on roster).
    #Owner;
    #CoOwner;
    #Manager;
    #AdvertiseManager;
    #ChiefAdmin;
    #SrDeveloper;
    #Developer;
    #Admin;
    #JrAdmin;
    #Mod;
    #Cop;
    #Builder;
    #SrCop;
  };

  /// The full set of roster ranks offered by the add-staff and two-step
  /// accept rank pickers. Mirrors the role groups shown on the Team page.
  /// The duplicate Sr-Admin variants have been removed and a new #Cop
  /// rank has been inserted immediately after #Mod (before #SrCop).
  public type RosterRank = {
    #Owner;
    #CoOwner;
    #Manager;
    #AdvertiseManager;
    #ChiefAdmin;
    #SrDeveloper;
    #Developer;
    #Admin;
    #JrAdmin;
    #Mod;
    #Cop;
    #Builder;
    #SrCop;
  };

  /// Role a member applies for via the 12-question form. The #Developer
  /// variant has been added alongside #Mod, #Admin, and #Builder so the
  /// Apply page can offer Developer as a selectable role. submitApplication
  /// stores any of these with status Pending; acceptApplication promotes
  /// the applicant and adds a roster member under the assigned rank.
  public type AppliedRole = {
    #Mod;
    #Admin;
    #Builder;
    #Developer;
  };

  /// Lifecycle of a submitted application.
  public type ApplicationStatus = {
    #Pending;
    #Accepted;
    #Declined;
  };

  /// A single application submission. `answers` holds the 12 form responses
  /// in question order. `status` starts Pending and is mutated only by
  /// reviewApplication.
  public type Application = {
    id : Common.ApplicationId;
    applicantUsername : Common.Username;
    appliedRole : AppliedRole;
    answers : [Text];
    timestamp : Common.Timestamp;
    status : ApplicationStatus;
  };

  /// Return shape of register — includes the assigned role.
  public type RegisterResult = {
    success : Bool;
    role : Role;
  };

  /// Return shape of login — includes the user's role on success.
  public type LoginResult = {
    success : Bool;
    role : Role;
  };

  /// Return shape of submitApplication — applicationId is null on failure.
  public type SubmitApplicationResult = {
    success : Bool;
    applicationId : ?Common.ApplicationId;
  };
};
