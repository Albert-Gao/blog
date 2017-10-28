export default class AutoBind extends React.Component {
  getChildren = () => {
    const { schema, allState, children } = this.props;
    const names = Object.keys(schema);
    return React.Children.map(children, child => {
      const childName = child.props.name;
      if (names.includes(childName)) {
        return React.cloneElement(child, {
          status: allState[childName].status,
          hint: allState[childName].errorText,
          value: allState[childName].value
        });
      }
      return child;
    });
  };

  render() {
    const newChildren = this.getChildren();
    return <section>{newChildren}</section>;
  }
}
