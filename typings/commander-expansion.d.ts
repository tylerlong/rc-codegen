declare namespace commander {
  interface IExportedCommand extends ICommand {
    language: string;
    output: string;
  }
}
