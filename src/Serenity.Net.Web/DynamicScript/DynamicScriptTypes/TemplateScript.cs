﻿using System;

namespace Serenity.Web
{
    public class TemplateScript : DynamicScript, INamedDynamicScript
    {
        private string key;
        private Func<string> getTemplate;

        public TemplateScript(string key, Func<string> getTemplate)
        {
            this.getTemplate = getTemplate ?? throw new ArgumentNullException(nameof(getTemplate));
            this.key = key ?? throw new ArgumentNullException(nameof(key));
        }

        public string ScriptName { get { return "Template." + key; } }

        public override string GetScript()
        {
            string templateText = getTemplate();

            return string.Format("Q.ScriptData.set({0}, {1})", 
                ("Template." + key).ToSingleQuoted(),
                templateText.ToSingleQuoted()); 
        }
    }
}