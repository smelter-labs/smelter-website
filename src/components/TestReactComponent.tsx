export default function TestReactComponent() {
  if (true) {
    console.log('x');
  }

  return (
    <div>
      <div>Test react component</div>
    </div>
  );
}

type IComment = {
  name: string;
};

export type { IComment };
