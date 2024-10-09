export const idlFactory = ({ IDL }) => {
  return IDL.Service({
    'getAllInputs' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Text))],
        ['query'],
      ),
    'getInput' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Text)], ['query']),
    'submitInput' : IDL.Func([IDL.Text], [], []),
  });
};
export const init = ({ IDL }) => { return []; };
