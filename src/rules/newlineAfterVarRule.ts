import * as ts from 'typescript'
import * as Lint from 'tslint'
import { getNextStatement, isVariableStatement, getNextToken } from 'tsutils'

export class Rule extends Lint.Rules.AbstractRule {
  public static NEWLINE_AFTER_VAR =
    'You must put a newline after var, let or const declarations'

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NewlineAfterVarWalker(sourceFile, this.ruleName, this.ruleArguments)
    )
  }
}

class NewlineAfterVarWalker extends Lint.AbstractWalker<any> {
  public walk(sourceFile: ts.SourceFile) {
    const cb = (node: ts.Node): void => {
      if (node.kind === ts.SyntaxKind.VariableStatement) {
        this.visitVariableStatement(node as ts.VariableStatement)
      }

      return ts.forEachChild(node, cb)
    }
    return ts.forEachChild(sourceFile, cb)
  }

  public visitVariableStatement(node: ts.VariableStatement) {
    const { sourceFile } = this
    const nodeStart = node.getStart(sourceFile)
    const next = getNextStatement(node)

    if (isVariableStatement(next)) {
      return
    }

    const nextStart = next.getStart(sourceFile)
    const line = ts.getLineAndCharacterOfPosition(sourceFile, nodeStart).line
    const nextLine = ts.getLineAndCharacterOfPosition(sourceFile, nextStart)
      .line

    if (nextLine - line > 1) {
      return
    }

    const nodeText = node.getText(sourceFile)
    const nodeWidth = node.getEnd() - nodeStart

    this.addFailure(nodeStart, node.getEnd(), Rule.NEWLINE_AFTER_VAR, [
      new Lint.Replacement(nodeStart, nodeWidth, `${nodeText}\n`)
    ])
  }
}
