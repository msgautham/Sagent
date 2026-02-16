package org.example;
import java.util.Scanner;

public class DatabaseConnectionTest {
    static void main() {
        int[] a = new int[10];
        int b, d;
        //TIP Press <shortcut actionId="ShowIntentionActions"/> with your caret at the highlighted text
        // to see how IntelliJ IDEA suggests fixing it.
        System.out.println("Hello and welcome!");
        Scanner sc = new Scanner(System.in);

        for (int i = 1; i <= 5; i++) {//TIP Press <shortcut actionId="Debug"/> to start debugging your code. We have set one <icon src="AllIcons.Debugger.Db_set_breakpoint"/> breakpoint
            // for you, but you can always add more by pressing <shortcut actionId="ToggleLineBreakpoint"/>.
            a[i]=sc.nextInt();
        }
        for (int i = 1; i <= 5; i++) {//TIP Press <shortcut actionId="Debug"/> to start debugging your code. We have set one <icon src="AllIcons.Debugger.Db_set_breakpoint"/> breakpoint
            // for you, but you   always add more by pressing <shortcut actionId="ToggleLineBreakpoint"/>.
            System.out.println(a[i]*a[i]);

        }

    }

}
